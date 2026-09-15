@isTest
private class ReturnServiceTest {
    @isTest
    static void testReturnValidationAndRefund() {
        Customer__c cust = ECommerceTestFactory.createCustomer();
        Category__c cat = ECommerceTestFactory.createCategory();
        Product__c prod = ECommerceTestFactory.createProduct(cat.Id);
        
        Order__c ord = new Order__c(
            Customer__c = cust.Id,
            Order_Date__c = System.now(),
            Order_Status__c = 'Delivered',
            Payment_Status__c = 'Paid',
            Actual_Delivery_Date__c = Date.today().addDays(-2),
            Subtotal__c = 1000.00,
            Shipping_Charge__c = 50.00
        );
        insert ord;
        
        Test.startTest();
        Return__c ret = new Return__c(
            Order__c = ord.Id,
            Customer__c = cust.Id,
            Return_Reason__c = 'Defective Product',
            Return_Status__c = 'Requested',
            Refund_Amount__c = 1000.00
        );
        insert ret;
        
        ret.Return_Status__c = 'Completed';
        update ret;
        Test.stopTest();
        
        List<Refund__c> refunds = [SELECT Id, Refund_Amount__c, Refund_Status__c FROM Refund__c WHERE Return__c = :ret.Id];
        System.assertEquals(1, refunds.size());
        System.assertEquals(1000.00, refunds[0].Refund_Amount__c);
    }
}
