trigger OrderTrigger on Order__c (before update, after update) {
    if (Trigger.isBefore && Trigger.isUpdate) {
        OrderTriggerHandler.onBeforeUpdate(Trigger.new, Trigger.oldMap);
    } else if (Trigger.isAfter && Trigger.isUpdate) {
        OrderTriggerHandler.onAfterUpdate(Trigger.new, Trigger.oldMap);
    }
}
