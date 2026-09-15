public inherited sharing class OrderService {
    public static void validateStatusTransitions(List<Order__c> newOrders, Map<Id, Order__c> oldMap) {
        for (Order__c ord : newOrders) {
            Order__c oldOrd = oldMap.get(ord.Id);
            if (oldOrd == null) continue;
            
            if (oldOrd.Order_Status__c == 'Delivered' && ord.Order_Status__c == 'Draft') {
                ord.addError('A delivered order cannot be reverted back to Draft status.');
            }
            if (oldOrd.Order_Status__c == 'Cancelled' && ord.Order_Status__c != 'Cancelled') {
                ord.addError('Cancelled orders cannot be reopened or edited.');
            }
        }
    }
    
    public static void handleStatusChange(List<Order__c> newOrders, Map<Id, Order__c> oldMap) {
        List<Id> confirmedOrderIds = new List<Id>();
        List<Id> cancelledOrderIds = new List<Id>();
        List<Id> completedOrderIds = new List<Id>();
        
        for (Order__c ord : newOrders) {
            Order__c oldOrd = oldMap != null ? oldMap.get(ord.Id) : null;
            if (oldOrd == null) continue;
            
            if (oldOrd.Order_Status__c != 'Confirmed' && ord.Order_Status__c == 'Confirmed') {
                confirmedOrderIds.add(ord.Id);
            }
            if (oldOrd.Order_Status__c != 'Cancelled' && ord.Order_Status__c == 'Cancelled') {
                cancelledOrderIds.add(ord.Id);
            }
            if (oldOrd.Order_Status__c != 'Completed' && ord.Order_Status__c == 'Completed') {
                completedOrderIds.add(ord.Id);
            }
        }
        
        if (!confirmedOrderIds.isEmpty()) {
            List<Order_Item__c> items = [
                SELECT Id, Order__c, Product__c, Quantity__c 
                FROM Order_Item__c 
                WHERE Order__c IN :confirmedOrderIds
            ];
            InventoryService.reserveStock(items);
        }
        
        if (!cancelledOrderIds.isEmpty()) {
            List<Order_Item__c> items = [
                SELECT Id, Order__c, Product__c, Quantity__c 
                FROM Order_Item__c 
                WHERE Order__c IN :cancelledOrderIds
            ];
            InventoryService.releaseStock(items, 'Order Cancelled');
        }
        
        if (!completedOrderIds.isEmpty()) {
            LoyaltyService.awardPointsForOrders(completedOrderIds);
        }
    }
    
    public static void recalculateOrderTotals(Set<Id> orderIds) {
        if (orderIds == null || orderIds.isEmpty()) return;
        
        List<AggregateResult> results = [
            SELECT Order__c, SUM(Total_Price__c) itemTotal
            FROM Order_Item__c
            WHERE Order__c IN :orderIds
            GROUP BY Order__c
        ];
        
        Map<Id, Decimal> totals = new Map<Id, Decimal>();
        for (AggregateResult ar : results) {
            totals.put((Id)ar.get('Order__c'), (Decimal)ar.get('itemTotal'));
        }
        
        List<Order__c> ordersToUpdate = new List<Order__c>();
        for (Id oId : orderIds) {
            Decimal sub = totals.containsKey(oId) ? totals.get(oId) : 0;
            ordersToUpdate.add(new Order__c(
                Id = oId,
                Subtotal__c = sub
            ));
        }
        
        if (!ordersToUpdate.isEmpty()) {
            update ordersToUpdate;
        }
    }
}
