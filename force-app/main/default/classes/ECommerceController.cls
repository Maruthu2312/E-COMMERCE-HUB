public inherited sharing class ECommerceController {
    
    @AuraEnabled(cacheable=true)
    public static List<Category__c> getCategories() {
        return [
            SELECT Id, Name, Category_Code__c, Description__c, Product_Count__c
            FROM Category__c
            WHERE Category_Status__c = 'Active'
            ORDER BY Name ASC
        ];
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Product__c> getProducts(String categoryId, String searchTerm, Decimal minPrice, Decimal maxPrice) {
        return ProductService.getAvailableProducts(categoryId, searchTerm, minPrice, maxPrice);
    }
    
    @AuraEnabled(cacheable=true)
    public static Product__c getProductDetails(Id productId) {
        return [
            SELECT Id, Name, Product_Code__c, Brand__c, Description__c, Price__c, Final_Price__c,
                   Discount_Percentage__c, Rating__c, Product_Image_URL__c, Available_Quantity__c,
                   Stock_Status__c, Stock_Quantity__c, Reorder_Level__c, Category__r.Name
            FROM Product__c
            WHERE Id = :productId
            LIMIT 1
        ];
    }
    
    @AuraEnabled
    public static CouponService.CouponResult applyCoupon(String couponCode, Decimal subtotal) {
        return CouponService.validateAndApplyCoupon(couponCode, subtotal);
    }
    
    @AuraEnabled
    public static Id placeOrder(Id customerId, String itemsJson, String shippingAddress, String billingAddress, String paymentMethod, String couponCode) {
        Savepoint sp = Database.setSavepoint();
        try {
            if (String.isBlank(itemsJson)) {
                throw new ECommerceException('Cannot place an empty order.');
            }
            
            List<Object> rawItems = (List<Object>)JSON.deserializeUntyped(itemsJson);
            if (rawItems.isEmpty()) {
                throw new ECommerceException('At least one item is required to place an order.');
            }
            
            Order__c newOrder = new Order__c(
                Customer__c = customerId,
                Order_Date__c = System.now(),
                Order_Status__c = 'Draft',
                Payment_Status__c = 'Pending',
                Shipping_Status__c = 'Not Shipped',
                Shipping_Address__c = shippingAddress,
                Billing_Address__c = billingAddress,
                Shipping_Charge__c = 50.00,
                Discount__c = 0.00,
                Tax__c = 0.00,
                Subtotal__c = 0.00
            );
            insert newOrder;
            
            Decimal calculatedSubtotal = 0;
            List<Order_Item__c> orderItems = new List<Order_Item__c>();
            
            for (Object itemObj : rawItems) {
                Map<String, Object> row = (Map<String, Object>)itemObj;
                Id prodId = (Id)row.get('productId');
                Decimal qty = Decimal.valueOf(String.valueOf(row.get('quantity')));
                Decimal unitPrice = Decimal.valueOf(String.valueOf(row.get('price')));
                
                Decimal itemSub = qty * unitPrice;
                calculatedSubtotal += itemSub;
                
                orderItems.add(new Order_Item__c(
                    Order__c = newOrder.Id,
                    Product__c = prodId,
                    Quantity__c = qty,
                    Unit_Price__c = unitPrice,
                    Discount__c = 0.00,
                    Tax__c = (itemSub * 0.18).setScale(2)
                ));
            }
            
            insert orderItems;
            
            Decimal discountAmt = 0;
            if (String.isNotBlank(couponCode)) {
                CouponService.CouponResult cr = CouponService.validateAndApplyCoupon(couponCode, calculatedSubtotal);
                if (cr.isValid) {
                    discountAmt = cr.discountAmount;
                }
            }
            
            newOrder.Subtotal__c = calculatedSubtotal;
            newOrder.Discount__c = discountAmt;
            newOrder.Tax__c = (calculatedSubtotal * 0.18).setScale(2);
            newOrder.Order_Status__c = 'Confirmed';
            update newOrder;
            
            // Create Payment
            Payment__c pmt = new Payment__c(
                Order__c = newOrder.Id,
                Customer__c = customerId,
                Amount__c = (newOrder.Subtotal__c - discountAmt + newOrder.Tax__c + 50.00).setScale(2),
                Payment_Method__c = paymentMethod,
                Payment_Status__c = 'Successful',
                Transaction_ID__c = 'TXN-' + String.valueOf(Crypto.getRandomInteger()).replace('-', ''),
                Payment_Date__c = System.now()
            );
            insert pmt;
            
            return newOrder.Id;
        } catch (Exception ex) {
            Database.rollback(sp);
            throw new AuraHandledException(ex.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Order__c> getCustomerOrders(Id customerId) {
        return [
            SELECT Id, Name, Order_Date__c, Order_Status__c, Payment_Status__c, Shipping_Status__c,
                   Grand_Total__c, Subtotal__c, Discount__c, Tax__c, Shipping_Address__c, Return_Eligibility__c,
                   (SELECT Id, Product__r.Name, Quantity__c, Unit_Price__c, Total_Price__c FROM Order_Items__r)
            FROM Order__c
            WHERE Customer__c = :customerId
            ORDER BY Order_Date__c DESC
        ];
    }
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getAdminKpis() {
        Map<String, Object> kpis = new Map<String, Object>();
        
        kpis.put('totalCustomers', [SELECT COUNT() FROM Customer__c]);
        kpis.put('totalOrders', [SELECT COUNT() FROM Order__c]);
        
        AggregateResult[] revResult = [SELECT SUM(Grand_Total__c) totalRev FROM Order__c WHERE Payment_Status__c = 'Paid'];
        kpis.put('totalRevenue', revResult[0].get('totalRev') != null ? revResult[0].get('totalRev') : 0);
        
        kpis.put('pendingOrders', [SELECT COUNT() FROM Order__c WHERE Order_Status__c IN ('Confirmed', 'Processing')]);
        kpis.put('deliveredOrders', [SELECT COUNT() FROM Order__c WHERE Order_Status__c = 'Delivered']);
        kpis.put('returnRequests', [SELECT COUNT() FROM Return__c WHERE Return_Status__c = 'Requested']);
        kpis.put('lowStockProducts', [SELECT COUNT() FROM Product__c WHERE Available_Quantity__c <= 10]);
        kpis.put('vipCustomers', [SELECT COUNT() FROM Customer__c WHERE Customer_Type__c = 'VIP']);
        
        return kpis;
    }
    @AuraEnabled(cacheable=true)
    public static List<Order__c> getAllRecentOrders() {
        return [
            SELECT Id, Name, Order_Date__c, Order_Status__c, Payment_Status__c, Shipping_Status__c,
                   Grand_Total__c, Subtotal__c, Discount__c, Tax__c, Shipping_Address__c, Return_Eligibility__c,
                   Customer__r.Customer_Name__c, Customer__r.Email__c, Customer__r.City__c,
                   (SELECT Id, Product__r.Name, Product__r.Product_Image_URL__c, Quantity__c, Unit_Price__c, Total_Price__c FROM Order_Items__r),
                   (SELECT Id, Tracking_Number__c, Courier_Name__c, Shipment_Status__c, Expected_Delivery_Date__c, Actual_Delivery_Date__c FROM Shipments__r)
            FROM Order__c
            ORDER BY Order_Date__c DESC
            LIMIT 50
        ];
    }
    
    @AuraEnabled
    public static String createOrderReturn(Id orderId, String reason) {
        Order__c ord = [SELECT Id, Customer__c, Grand_Total__c, Order_Status__c, Return_Eligibility__c FROM Order__c WHERE Id = :orderId LIMIT 1];
        if (ord.Order_Status__c != 'Delivered' && ord.Order_Status__c != 'Completed') {
            throw new AuraHandledException('Returns can only be requested for Delivered or Completed orders.');
        }
        
        Return__c ret = new Return__c(
            Order__c = ord.Id,
            Customer__c = ord.Customer__c,
            Return_Reason__c = String.isNotBlank(reason) ? reason : 'Defective Product',
            Return_Status__c = 'Requested',
            Refund_Amount__c = ord.Grand_Total__c,
            Return_Date__c = Date.today(),
            Return_Description__c = 'Return requested via E-Commerce Hub'
        );
        insert ret;
        return ret.Id;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Wishlist__c> getWishlistItems(Id customerId) {
        return [
            SELECT Id, Added_Date__c, Wishlist_Status__c, Product__c,
                   Product__r.Id, Product__r.Name, Product__r.Brand__c, Product__r.Price__c,
                   Product__r.Final_Price__c, Product__r.Discount_Percentage__c, Product__r.Rating__c,
                   Product__r.Product_Image_URL__c, Product__r.Stock_Status__c, Product__r.Available_Quantity__c,
                   Product__r.Category__r.Name
            FROM Wishlist__c
            WHERE Wishlist_Status__c = 'Active'
            ORDER BY Added_Date__c DESC
            LIMIT 50
        ];
    }
    
    @AuraEnabled
    public static Boolean toggleWishlist(Id customerId, Id productId) {
        if (customerId == null) {
            Customer__c cust = [SELECT Id FROM Customer__c LIMIT 1];
            customerId = cust.Id;
        }
        List<Wishlist__c> existing = [SELECT Id FROM Wishlist__c WHERE Customer__c = :customerId AND Product__c = :productId LIMIT 1];
        if (!existing.isEmpty()) {
            delete existing;
            return false;
        } else {
            insert new Wishlist__c(
                Customer__c = customerId,
                Product__c = productId,
                Added_Date__c = Date.today(),
                Wishlist_Status__c = 'Active'
            );
            return true;
        }
    }
    
    @AuraEnabled
    public static void restockProduct(Id productId, Integer quantityToAdd) {
        Product__c p = [SELECT Id, Name, Stock_Quantity__c FROM Product__c WHERE Id = :productId LIMIT 1];
        Decimal prev = p.Stock_Quantity__c != null ? p.Stock_Quantity__c : 0;
        Decimal added = quantityToAdd != null && quantityToAdd > 0 ? quantityToAdd : 20;
        p.Stock_Quantity__c = prev + added;
        update p;
        
        insert new Inventory_Transaction__c(
            Product__c = p.Id,
            Transaction_Type__c = 'Adjustment',
            Quantity__c = added,
            Previous_Stock__c = prev,
            New_Stock__c = prev + added,
            Transaction_Date__c = System.now(),
            Reason__c = 'Manual Restock from E-Commerce Operations Hub'
        );
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Product__c> getLowStockProducts() {
        return [
            SELECT Id, Name, Product_Code__c, Brand__c, Stock_Quantity__c, Reserved_Quantity__c,
                   Available_Quantity__c, Reorder_Level__c, Stock_Status__c, Price__c, Final_Price__c,
                   Category__r.Name
            FROM Product__c
            WHERE Available_Quantity__c <= 25
            ORDER BY Available_Quantity__c ASC
            LIMIT 20
        ];
    }
}
