public inherited sharing class RefundService {
    public static void processRefundsForCompletedReturns(List<Return__c> returns, Map<Id, Return__c> oldMap) {
        List<Refund__c> refundsToCreate = new List<Refund__c>();
        
        for (Return__c ret : returns) {
            Return__c oldRet = oldMap.get(ret.Id);
            if (oldRet == null) continue;
            
            if (oldRet.Return_Status__c != 'Completed' && ret.Return_Status__c == 'Completed') {
                if (ret.Refund_Amount__c != null && ret.Refund_Amount__c > 0) {
                    refundsToCreate.add(new Refund__c(
                        Return__c = ret.Id,
                        Order__c = ret.Order__c,
                        Customer__c = ret.Customer__c,
                        Refund_Amount__c = ret.Refund_Amount__c,
                        Refund_Method__c = 'Original Payment Method',
                        Refund_Status__c = 'Processing',
                        Refund_Date__c = System.now(),
                        Transaction_ID__c = 'REF-' + String.valueOf(Crypto.getRandomInteger()).replace('-', '')
                    ));
                }
            }
        }
        
        if (!refundsToCreate.isEmpty()) {
            insert refundsToCreate;
        }
    }
}
