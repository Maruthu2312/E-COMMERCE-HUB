@isTest
private class InventoryServiceTest {
    @isTest
    static void testReserveAndReleaseStock() {
        Customer__c cust = ECommerceTestFactory.createCustomer();
        Category__c cat = ECommerceTestFactory.createCategory();
        Product__c p = ECommerceTestFactory.createProduct(cat.Id);
        
        Order__c ord = new Order__c(
            Customer__c = cust.Id,
            Order_Date__c = System.now(),
            Order_Status__c = 'Draft',
            Payment_Status__c = 'Pending',
            Subtotal__c = 1000.00,
            Shipping_Charge__c = 50.00
        );
        insert ord;
        
        Order_Item__c item = new Order_Item__c(
            Order__c = ord.Id,
            Product__c = p.Id,
            Quantity__c = 5,
            Unit_Price__c = 1000.00
        );
        insert item;
        
        Test.startTest();
        InventoryService.reserveStock(new List<Order_Item__c>{ item });
        
        Product__c reservedProd = [SELECT Reserved_Quantity__c FROM Product__c WHERE Id = :p.Id];
        System.assertEquals(5, reservedProd.Reserved_Quantity__c);
        
        InventoryService.releaseStock(new List<Order_Item__c>{ item }, 'Test Cancellation');
        Test.stopTest();
        
        Product__c releasedProd = [SELECT Reserved_Quantity__c FROM Product__c WHERE Id = :p.Id];
        System.assertEquals(0, releasedProd.Reserved_Quantity__c);
    }
}
