public inherited sharing class LoyaltyService {
    public static void awardPointsForOrders(List<Id> orderIds) {
        if (orderIds == null || orderIds.isEmpty()) return;
        
        List<Order__c> orders = [
            SELECT Id, Customer__c, Grand_Total__c
            FROM Order__c
            WHERE Id IN :orderIds AND Customer__c != null
        ];
        
        List<Loyalty_Transaction__c> txns = new List<Loyalty_Transaction__c>();
        Map<Id, Decimal> customerPointsMap = new Map<Id, Decimal>();
        
        for (Order__c ord : orders) {
            Decimal spending = ord.Grand_Total__c != null ? ord.Grand_Total__c : 0;
            // 1 point per 100 INR spent
            Decimal pointsEarned = Math.floor(spending / 100);
            if (pointsEarned <= 0) continue;
            
            txns.add(new Loyalty_Transaction__c(
                Customer__c = ord.Customer__c,
                Order__c = ord.Id,
                Points_Earned__c = pointsEarned,
                Points_Redeemed__c = 0,
                Transaction_Type__c = 'Earned',
                Transaction_Date__c = System.now(),
                Description__c = 'Loyalty points earned for Order ' + ord.Id
            ));
            
            Decimal current = customerPointsMap.containsKey(ord.Customer__c) ? customerPointsMap.get(ord.Customer__c) : 0;
            customerPointsMap.put(ord.Customer__c, current + pointsEarned);
        }
        
        if (!txns.isEmpty()) {
            insert txns;
        }
        
        if (!customerPointsMap.isEmpty()) {
            List<Customer__c> custs = [
                SELECT Id, Loyalty_Points__c, Total_Spending__c, Customer_Type__c
                FROM Customer__c
                WHERE Id IN :customerPointsMap.keySet()
            ];
            for (Customer__c c : custs) {
                c.Loyalty_Points__c = (c.Loyalty_Points__c != null ? c.Loyalty_Points__c : 0) + customerPointsMap.get(c.Id);
                // Recalculate Tier
                if (c.Loyalty_Points__c >= 1000) {
                    c.Customer_Type__c = 'VIP';
                } else if (c.Loyalty_Points__c >= 500) {
                    c.Customer_Type__c = 'Platinum';
                } else if (c.Loyalty_Points__c >= 250) {
                    c.Customer_Type__c = 'Gold';
                } else if (c.Loyalty_Points__c >= 100) {
                    c.Customer_Type__c = 'Silver';
                } else {
                    c.Customer_Type__c = 'Regular';
                }
            }
            update custs;
        }
    }
}
