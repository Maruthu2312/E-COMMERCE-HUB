trigger ReturnTrigger on Return__c (before insert, after update) {
    if (Trigger.isBefore && Trigger.isInsert) {
        ReturnTriggerHandler.onBeforeInsert(Trigger.new);
    } else if (Trigger.isAfter && Trigger.isUpdate) {
        ReturnTriggerHandler.onAfterUpdate(Trigger.new, Trigger.oldMap);
    }
}
