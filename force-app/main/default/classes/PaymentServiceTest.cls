@isTest
private class PaymentServiceTest {
    @isTest
    static void testPaymentUpdates() {
        Customer__c cust = ECommerceTestFactory.createCustomer();
        Category__c cat = ECommerceTestFactory.createCategory();
        Product__c prod = ECommerceTestFactory.createProduct(cat.Id);
        
        Order__c ord = new Order__c(
            Customer__c = cust.Id,
            Order_Date__c = System.now(),
            Order_Status__c = 'Draft',
            Payment_Status__c = 'Pending',
            Subtotal__c = 1000.00,
            Shipping_Charge__c = 50.00
        );
        insert ord;
        
        Test.startTest();
        Payment__c pmt = new Payment__c(
            Order__c = ord.Id,
            Customer__c = cust.Id,
            Amount__c = 1050.00,
            Payment_Method__c = 'Credit Card',
            Payment_Status__c = 'Successful',
            Transaction_ID__c = 'TXN-TEST-123',
            Payment_Date__c = System.now()
        );
        insert pmt;
        Test.stopTest();
        
        Order__c updatedOrd = [SELECT Payment_Status__c, Order_Status__c FROM Order__c WHERE Id = :ord.Id];
        System.assertEquals('Paid', updatedOrd.Payment_Status__c);
        System.assertEquals('Confirmed', updatedOrd.Order_Status__c);
    }
}
