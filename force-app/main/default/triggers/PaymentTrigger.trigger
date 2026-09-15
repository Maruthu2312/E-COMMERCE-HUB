trigger PaymentTrigger on Payment__c (after insert, after update) {
    if (Trigger.isAfter && Trigger.isInsert) {
        PaymentTriggerHandler.onAfterInsert(Trigger.new);
    } else if (Trigger.isAfter && Trigger.isUpdate) {
        PaymentTriggerHandler.onAfterUpdate(Trigger.new, Trigger.oldMap);
    }
}
