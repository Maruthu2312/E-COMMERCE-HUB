public inherited sharing class InventoryService {
    public static void reserveStock(List<Order_Item__c> orderItems) {
        if (orderItems == null || orderItems.isEmpty()) return;
        
        Set<Id> productIds = new Set<Id>();
        Map<Id, Decimal> qtyByProduct = new Map<Id, Decimal>();
        for (Order_Item__c item : orderItems) {
            if (item.Product__c != null && item.Quantity__c != null) {
                productIds.add(item.Product__c);
                Decimal cur = qtyByProduct.containsKey(item.Product__c) ? qtyByProduct.get(item.Product__c) : 0;
                qtyByProduct.put(item.Product__c, cur + item.Quantity__c);
            }
        }
        
        Map<Id, Product__c> productMap = new Map<Id, Product__c>([
            SELECT Id, Name, Stock_Quantity__c, Reserved_Quantity__c, Available_Quantity__c
            FROM Product__c
            WHERE Id IN :productIds
            FOR UPDATE
        ]);
        
        List<Product__c> prodsToUpdate = new List<Product__c>();
        List<Inventory_Transaction__c> txns = new List<Inventory_Transaction__c>();
        
        for (Order_Item__c item : orderItems) {
            Product__c prod = productMap.get(item.Product__c);
            if (prod == null) continue;
            
            Decimal requested = item.Quantity__c;
            Decimal available = (prod.Stock_Quantity__c != null ? prod.Stock_Quantity__c : 0) - 
                                (prod.Reserved_Quantity__c != null ? prod.Reserved_Quantity__c : 0);
            
            if (available < requested) {
                throw new ECommerceException('Insufficient stock for product "' + prod.Name + 
                    '". Available: ' + available + ', Requested: ' + requested);
            }
            
            Decimal prevStock = prod.Stock_Quantity__c != null ? prod.Stock_Quantity__c : 0;
            prod.Reserved_Quantity__c = (prod.Reserved_Quantity__c != null ? prod.Reserved_Quantity__c : 0) + requested;
            prodsToUpdate.add(prod);
            
            txns.add(new Inventory_Transaction__c(
                Product__c = prod.Id,
                Reference_Order__c = item.Order__c,
                Transaction_Type__c = 'Reservation',
                Quantity__c = requested,
                Previous_Stock__c = prevStock,
                New_Stock__c = prevStock,
                Transaction_Date__c = System.now(),
                Reason__c = 'Stock reserved for Order ' + item.Order__c
            ));
        }
        
        if (!prodsToUpdate.isEmpty()) {
            update new List<Product__c>(new Set<Product__c>(prodsToUpdate));
        }
        if (!txns.isEmpty()) {
            insert txns;
        }
    }
    
    public static void releaseStock(List<Order_Item__c> orderItems, String reason) {
        if (orderItems == null || orderItems.isEmpty()) return;
        
        Set<Id> productIds = new Set<Id>();
        for (Order_Item__c item : orderItems) {
            if (item.Product__c != null) productIds.add(item.Product__c);
        }
        
        Map<Id, Product__c> productMap = new Map<Id, Product__c>([
            SELECT Id, Name, Stock_Quantity__c, Reserved_Quantity__c
            FROM Product__c
            WHERE Id IN :productIds
            FOR UPDATE
        ]);
        
        List<Product__c> prodsToUpdate = new List<Product__c>();
        List<Inventory_Transaction__c> txns = new List<Inventory_Transaction__c>();
        
        for (Order_Item__c item : orderItems) {
            Product__c prod = productMap.get(item.Product__c);
            if (prod == null) continue;
            
            Decimal qty = item.Quantity__c != null ? item.Quantity__c : 0;
            Decimal prevStock = prod.Stock_Quantity__c != null ? prod.Stock_Quantity__c : 0;
            prod.Reserved_Quantity__c = Math.max(0, (prod.Reserved_Quantity__c != null ? prod.Reserved_Quantity__c : 0) - qty);
            prodsToUpdate.add(prod);
            
            txns.add(new Inventory_Transaction__c(
                Product__c = prod.Id,
                Reference_Order__c = item.Order__c,
                Transaction_Type__c = 'Release',
                Quantity__c = qty,
                Previous_Stock__c = prevStock,
                New_Stock__c = prevStock,
                Transaction_Date__c = System.now(),
                Reason__c = String.isNotBlank(reason) ? reason : 'Stock reservation released'
            ));
        }
        
        if (!prodsToUpdate.isEmpty()) {
            update new List<Product__c>(new Set<Product__c>(prodsToUpdate));
        }
        if (!txns.isEmpty()) {
            insert txns;
        }
    }
}
