public inherited sharing class OrderItemTriggerHandler {
    public static void onAfterInsert(List<Order_Item__c> newItems) {
        Set<Id> orderIds = new Set<Id>();
        for (Order_Item__c item : newItems) {
            if (item.Order__c != null) orderIds.add(item.Order__c);
        }
        OrderService.recalculateOrderTotals(orderIds);
    }
    
    public static void onAfterDelete(List<Order_Item__c> oldItems) {
        Set<Id> orderIds = new Set<Id>();
        for (Order_Item__c item : oldItems) {
            if (item.Order__c != null) orderIds.add(item.Order__c);
        }
        OrderService.recalculateOrderTotals(orderIds);
    }
}
