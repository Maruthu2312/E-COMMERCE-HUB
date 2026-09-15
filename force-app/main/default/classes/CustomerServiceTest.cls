@isTest
private class CustomerServiceTest {
    @isTest
    static void testRegisterCustomer() {
        Test.startTest();
        Customer__c c = CustomerService.registerCustomer(
            'Test Customer',
            'test.customer@example.com',
            '+91 9988776655',
            '100 MG Road',
            'Bengaluru',
            'Karnataka',
            '560001'
        );
        Test.stopTest();
        
        System.assertNotEquals(null, c.Id);
        System.assertEquals('Test Customer', c.Customer_Name__c);
    }
    
    @isTest
    static void testDuplicateRegistrationFails() {
        Customer__c c = ECommerceTestFactory.createCustomer();
        
        Test.startTest();
        try {
            CustomerService.registerCustomer(
                'Duplicate Cust',
                c.Email__c,
                '+91 9988776655',
                '100 MG Road',
                'Bengaluru',
                'Karnataka',
                '560001'
            );
            System.assert(false, 'Exception expected for duplicate email');
        } catch (ECommerceException ex) {
            System.assert(ex.getMessage().contains('already exists'));
        }
        Test.stopTest();
    }
    
    @isTest
    static void testRecalculateCustomerMetrics() {
        Customer__c cust = ECommerceTestFactory.createCustomer();
        Category__c cat = ECommerceTestFactory.createCategory();
        Product__c prod = ECommerceTestFactory.createProduct(cat.Id);
        
        Order__c ord = new Order__c(
            Customer__c = cust.Id,
            Order_Date__c = System.now(),
            Order_Status__c = 'Delivered',
            Payment_Status__c = 'Paid',
            Subtotal__c = 1000.00,
            Shipping_Charge__c = 50.00
        );
        insert ord;
        
        Test.startTest();
        CustomerService.recalculateCustomerMetrics(new Set<Id>{ cust.Id });
        Test.stopTest();
        
        Customer__c updatedCust = [SELECT Total_Orders__c, Total_Spending__c FROM Customer__c WHERE Id = :cust.Id];
        System.assertEquals(1, updatedCust.Total_Orders__c);
    }
}
