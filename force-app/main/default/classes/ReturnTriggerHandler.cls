public inherited sharing class ReturnTriggerHandler {
    public static void onBeforeInsert(List<Return__c> newReturns) {
        ReturnService.validateReturnEligibility(newReturns);
    }
    
    public static void onAfterUpdate(List<Return__c> newReturns, Map<Id, Return__c> oldMap) {
        RefundService.processRefundsForCompletedReturns(newReturns, oldMap);
    }
}
