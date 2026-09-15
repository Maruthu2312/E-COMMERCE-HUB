public inherited sharing class OrderTriggerHandler {
    public static Boolean isExecuting = false;
    
    public static void onBeforeUpdate(List<Order__c> newOrders, Map<Id, Order__c> oldMap) {
        OrderService.validateStatusTransitions(newOrders, oldMap);
    }
    
    public static void onAfterUpdate(List<Order__c> newOrders, Map<Id, Order__c> oldMap) {
        if (isExecuting) return;
        isExecuting = true;
        try {
            OrderService.handleStatusChange(newOrders, oldMap);
        } finally {
            isExecuting = false;
        }
    }
}
