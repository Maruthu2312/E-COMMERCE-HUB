public inherited sharing class PaymentTriggerHandler {
    public static void onAfterInsert(List<Payment__c> newPayments) {
        PaymentService.handlePaymentUpdates(newPayments, null);
    }
    
    public static void onAfterUpdate(List<Payment__c> newPayments, Map<Id, Payment__c> oldMap) {
        PaymentService.handlePaymentUpdates(newPayments, oldMap);
    }
}
