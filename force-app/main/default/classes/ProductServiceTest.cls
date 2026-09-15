@isTest
private class ProductServiceTest {
    @isTest
    static void testGetAvailableProducts() {
        Category__c cat = ECommerceTestFactory.createCategory();
        Product__c p = ECommerceTestFactory.createProduct(cat.Id);
        
        Test.startTest();
        List<Product__c> prods = ProductService.getAvailableProducts(cat.Id, 'OnePlus', 100, 100000);
        Test.stopTest();
        
        System.assert(!prods.isEmpty());
    }
    
    @isTest
    static void testRecalculateRatings() {
        Customer__c cust = ECommerceTestFactory.createCustomer();
        Category__c cat = ECommerceTestFactory.createCategory();
        Product__c p = ECommerceTestFactory.createProduct(cat.Id);
        
        Review__c r = new Review__c(
            Product__c = p.Id,
            Customer__c = cust.Id,
            Rating__c = 5.0,
            Review_Title__c = 'Great',
            Review_Description__c = 'Great product',
            Review_Status__c = 'Approved'
        );
        insert r;
        
        Test.startTest();
        ProductService.recalculateRatings(new Set<Id>{ p.Id });
        Test.stopTest();
        
        Product__c updatedP = [SELECT Rating__c FROM Product__c WHERE Id = :p.Id];
        System.assertEquals(5.0, updatedP.Rating__c);
    }
}
