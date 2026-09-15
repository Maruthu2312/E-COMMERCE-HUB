@isTest
private class OrderServiceTest {
    @isTest
    static void testOrderLifecycle() {
        Customer__c cust = ECommerceTestFactory.createCustomer();
        Category__c cat = ECommerceTestFactory.createCategory();
        Product__c prod = ECommerceTestFactory.createProduct(cat.Id);
        
        Test.startTest();
        Order__c ord = new Order__c(
            Customer__c = cust.Id,
            Order_Date__c = System.now(),
            Order_Status__c = 'Draft',
            Payment_Status__c = 'Pending',
            Subtotal__c = 64999.00,
            Shipping_Charge__c = 50.00
        );
        insert ord;
        
        Order_Item__c item = new Order_Item__c(
            Order__c = ord.Id,
            Product__c = prod.Id,
            Quantity__c = 2,
            Unit_Price__c = 58499.10
        );
        insert item;
        
        // Confirm Order
        ord.Order_Status__c = 'Confirmed';
        update ord;
        
        Product__c updatedProd = [SELECT Reserved_Quantity__c FROM Product__c WHERE Id = :prod.Id];
        System.assertEquals(2, updatedProd.Reserved_Quantity__c, 'Reserved quantity must be incremented by 2');
        
        // Deliver and Complete Order
        ord.Order_Status__c = 'Delivered';
        ord.Actual_Delivery_Date__c = Date.today();
        update ord;
        
        ord.Order_Status__c = 'Completed';
        update ord;
        
        Test.stopTest();
        
        Customer__c updatedCust = [SELECT Loyalty_Points__c FROM Customer__c WHERE Id = :cust.Id];
        System.assert(updatedCust.Loyalty_Points__c > 50, 'Loyalty points should have been awarded.');
    }
}
