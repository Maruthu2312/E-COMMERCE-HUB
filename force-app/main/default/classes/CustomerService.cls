public inherited sharing class CustomerService {
    @AuraEnabled
    public static Customer__c registerCustomer(String name, String email, String phone, String street, String city, String state, String postalCode) {
        if (String.isBlank(name) || String.isBlank(email)) {
            throw new ECommerceException('Customer Name and Email are mandatory.');
        }
        
        List<Customer__c> existing = [SELECT Id FROM Customer__c WHERE Email__c = :email LIMIT 1];
        if (!existing.isEmpty()) {
            throw new ECommerceException('Customer with email ' + email + ' already exists.');
        }
        
        Customer__c newCust = new Customer__c(
            Customer_Name__c = name,
            Email__c = email,
            Phone__c = phone,
            Street__c = street,
            City__c = city,
            State__c = state,
            Postal_Code__c = postalCode,
            Country__c = 'India',
            Customer_Type__c = 'Regular',
            Customer_Status__c = 'Active',
            Registration_Date__c = Date.today(),
            Loyalty_Points__c = 0,
            Total_Orders__c = 0,
            Total_Spending__c = 0.0
        );
        insert newCust;
        return newCust;
    }
    
    public static void recalculateCustomerMetrics(Set<Id> customerIds) {
        if (customerIds == null || customerIds.isEmpty()) return;
        
        List<AggregateResult> results = [
            SELECT Customer__c, COUNT(Id) totalOrders, SUM(Grand_Total__c) totalSpend, MAX(Order_Date__c) lastDate
            FROM Order__c
            WHERE Customer__c IN :customerIds AND Order_Status__c IN ('Confirmed', 'Shipped', 'Delivered', 'Completed')
            GROUP BY Customer__c
        ];
        
        Map<Id, Customer__c> toUpdate = new Map<Id, Customer__c>();
        for (AggregateResult ar : results) {
            Id cId = (Id)ar.get('Customer__c');
            Decimal spend = (Decimal)ar.get('totalSpend');
            Datetime dt = (Datetime)ar.get('lastDate');
            
            Customer__c c = new Customer__c(
                Id = cId,
                Total_Orders__c = (Integer)ar.get('totalOrders'),
                Total_Spending__c = spend != null ? spend : 0,
                Last_Order_Date__c = dt != null ? dt.date() : null
            );
            toUpdate.put(cId, c);
        }
        
        if (!toUpdate.isEmpty()) {
            update toUpdate.values();
        }
    }
}
