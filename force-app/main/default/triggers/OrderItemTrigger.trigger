trigger OrderItemTrigger on Order_Item__c (after insert, after delete) {
    if (Trigger.isAfter && Trigger.isInsert) {
        OrderItemTriggerHandler.onAfterInsert(Trigger.new);
    } else if (Trigger.isAfter && Trigger.isDelete) {
        OrderItemTriggerHandler.onAfterDelete(Trigger.old);
    }
}
