@isTest
private class ECommerceControllerTest {
    @isTest
    static void testControllerMethods() {
        Customer__c cust = ECommerceTestFactory.createCustomer();
        Category__c cat = ECommerceTestFactory.createCategory();
        Product__c prod = ECommerceTestFactory.createProduct(cat.Id);
        Coupon__c coup = ECommerceTestFactory.createCoupon();
        
        Test.startTest();
        List<Category__c> cats = ECommerceController.getCategories();
        System.assert(!cats.isEmpty());
        
        List<Product__c> prods = ECommerceController.getProducts(cat.Id, 'OnePlus', 0, 100000);
        System.assert(!prods.isEmpty());
        
        Product__c fetchedProd = ECommerceController.getProductDetails(prod.Id);
        System.assertEquals(prod.Id, fetchedProd.Id);
        
        // Place Order
        String itemsJson = '[{"productId":"' + prod.Id + '","quantity":1,"price":58499.10}]';
        Id orderId = ECommerceController.placeOrder(
            cust.Id,
            itemsJson,
            '123 MG Road, Bengaluru',
            '123 MG Road, Bengaluru',
            'UPI',
            coup.Coupon_Code__c
        );
        System.assertNotEquals(null, orderId);
        
        List<Order__c> custOrders = ECommerceController.getCustomerOrders(cust.Id);
        System.assert(!custOrders.isEmpty());
        
        Map<String, Object> kpis = ECommerceController.getAdminKpis();
        System.assert(kpis.containsKey('totalRevenue'));
        
        // Test Wishlist
        Boolean added = ECommerceController.toggleWishlist(cust.Id, prod.Id);
        System.assertEquals(true, added);
        List<Wishlist__c> wishItems = ECommerceController.getWishlistItems(cust.Id);
        System.assert(!wishItems.isEmpty());
        Boolean removed = ECommerceController.toggleWishlist(cust.Id, prod.Id);
        System.assertEquals(false, removed);
        
        // Test Restock & Low Stock
        ECommerceController.restockProduct(prod.Id, 25);
        List<Product__c> lowStock = ECommerceController.getLowStockProducts();
        System.assertNotEquals(null, lowStock);
        
        // Test Recent Orders
        List<Order__c> recentOrders = ECommerceController.getAllRecentOrders();
        System.assert(!recentOrders.isEmpty());
        
        // Test Return
        Order__c ord = [SELECT Id, Order_Status__c, Actual_Delivery_Date__c FROM Order__c WHERE Id = :orderId];
        ord.Order_Status__c = 'Delivered';
        ord.Actual_Delivery_Date__c = Date.today().addDays(-2);
        update ord;
        String retId = ECommerceController.createOrderReturn(ord.Id, 'Defective product');
        System.assertNotEquals(null, retId);
        Test.stopTest();
    }
}
