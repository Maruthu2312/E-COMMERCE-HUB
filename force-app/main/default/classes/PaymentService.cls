public inherited sharing class PaymentService {
    public static void handlePaymentUpdates(List<Payment__c> newPayments, Map<Id, Payment__c> oldMap) {
        Set<Id> paidOrderIds = new Set<Id>();
        Set<Id> failedOrderIds = new Set<Id>();
        
        for (Payment__c p : newPayments) {
            Payment__c oldP = oldMap != null ? oldMap.get(p.Id) : null;
            if (p.Order__c == null) continue;
            
            if (p.Payment_Status__c == 'Successful' && (oldP == null || oldP.Payment_Status__c != 'Successful')) {
                paidOrderIds.add(p.Order__c);
            } else if (p.Payment_Status__c == 'Failed' && (oldP == null || oldP.Payment_Status__c != 'Failed')) {
                failedOrderIds.add(p.Order__c);
            }
        }
        
        List<Order__c> ordersToUpdate = new List<Order__c>();
        if (!paidOrderIds.isEmpty()) {
            for (Id oId : paidOrderIds) {
                ordersToUpdate.add(new Order__c(
                    Id = oId,
                    Payment_Status__c = 'Paid',
                    Order_Status__c = 'Confirmed'
                ));
            }
        }
        if (!failedOrderIds.isEmpty()) {
            for (Id oId : failedOrderIds) {
                ordersToUpdate.add(new Order__c(
                    Id = oId,
                    Payment_Status__c = 'Failed'
                ));
            }
        }
        
        if (!ordersToUpdate.isEmpty()) {
            update ordersToUpdate;
        }
    }
}
