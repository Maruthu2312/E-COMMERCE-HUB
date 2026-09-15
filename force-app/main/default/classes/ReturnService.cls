public inherited sharing class ReturnService {
    public static void validateReturnEligibility(List<Return__c> returns) {
        Set<Id> orderIds = new Set<Id>();
        for (Return__c ret : returns) {
            if (ret.Order__c != null) orderIds.add(ret.Order__c);
        }
        
        Map<Id, Order__c> orders = new Map<Id, Order__c>([
            SELECT Id, Order_Status__c, Actual_Delivery_Date__c, Return_Eligibility__c
            FROM Order__c
            WHERE Id IN :orderIds
        ]);
        
        for (Return__c ret : returns) {
            Order__c ord = orders.get(ret.Order__c);
            if (ord == null) {
                ret.addError('Associated Order record could not be found.');
                continue;
            }
            if (ord.Order_Status__c != 'Delivered' && ord.Order_Status__c != 'Completed') {
                ret.addError('Returns can only be created for Delivered or Completed orders.');
            }
            if (ord.Actual_Delivery_Date__c != null) {
                Integer daysSinceDelivery = Date.today().daysBetween(ord.Actual_Delivery_Date__c);
                if (Math.abs(daysSinceDelivery) > 15) {
                    ret.addError('Return policy period expired. Returns must be requested within 15 days of delivery.');
                }
            }
        }
    }
}
