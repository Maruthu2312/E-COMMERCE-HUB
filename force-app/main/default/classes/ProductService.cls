public inherited sharing class ProductService {
    public static List<Product__c> getAvailableProducts(String categoryId, String searchTerm, Decimal minPrice, Decimal maxPrice) {
        String query = 'SELECT Id, Name, Product_Code__c, Brand__c, Description__c, Price__c, Final_Price__c, ' +
                       'Discount_Percentage__c, Rating__c, Product_Image_URL__c, Available_Quantity__c, Stock_Status__c, ' +
                       'Category__c, Category__r.Name FROM Product__c WHERE Product_Status__c = \'Active\'';
        
        List<String> conditions = new List<String>();
        if (String.isNotBlank(categoryId)) {
            conditions.add('Category__c = :categoryId');
        }
        if (String.isNotBlank(searchTerm)) {
            String sanitizedTerm = '%' + String.escapeSingleQuotes(searchTerm) + '%';
            conditions.add('(Name LIKE :sanitizedTerm OR Brand__c LIKE :sanitizedTerm OR Product_Code__c LIKE :sanitizedTerm)');
        }
        if (minPrice != null && minPrice >= 0) {
            conditions.add('Price__c >= :minPrice');
        }
        if (maxPrice != null && maxPrice > 0) {
            conditions.add('Price__c <= :maxPrice');
        }
        
        if (!conditions.isEmpty()) {
            query += ' AND ' + String.join(conditions, ' AND ');
        }
        query += ' ORDER BY Name ASC LIMIT 200';
        
        return Database.query(query);
    }
    
    public static void recalculateRatings(Set<Id> productIds) {
        if (productIds == null || productIds.isEmpty()) return;
        
        List<AggregateResult> results = [
            SELECT Product__c, AVG(Rating__c) avgRating, COUNT(Id) reviewCount
            FROM Review__c
            WHERE Product__c IN :productIds AND Review_Status__c = 'Approved'
            GROUP BY Product__c
        ];
        
        Map<Id, Product__c> productsToUpdate = new Map<Id, Product__c>();
        for (AggregateResult ar : results) {
            Id prodId = (Id)ar.get('Product__c');
            Decimal avg = (Decimal)ar.get('avgRating');
            productsToUpdate.put(prodId, new Product__c(
                Id = prodId,
                Rating__c = avg != null ? avg.setScale(2) : 5.0
            ));
        }
        
        for (Id prodId : productIds) {
            if (!productsToUpdate.containsKey(prodId)) {
                productsToUpdate.put(prodId, new Product__c(Id = prodId, Rating__c = 0.0));
            }
        }
        
        if (!productsToUpdate.isEmpty()) {
            update productsToUpdate.values();
        }
    }
}
