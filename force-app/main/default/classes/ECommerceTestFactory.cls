@isTest
public class ECommerceTestFactory {
    public static Customer__c createCustomer() {
        Customer__c c = new Customer__c(
            Customer_Name__c = 'Aarav Sharma',
            Email__c = 'aarav.sharma' + Crypto.getRandomInteger() + '@example.com',
            Phone__c = '+91 9876543210',
            Customer_Type__c = 'Regular',
            Customer_Status__c = 'Active',
            Registration_Date__c = Date.today(),
            Loyalty_Points__c = 50,
            Total_Spending__c = 15000.00
        );
        insert c;
        return c;
    }
    
    public static Category__c createCategory() {
        Category__c cat = new Category__c(
            Name = 'Electronics',
            Category_Code__c = 'ELEC-' + Crypto.getRandomInteger(),
            Category_Status__c = 'Active'
        );
        insert cat;
        return cat;
    }
    
    public static Product__c createProduct(Id catId) {
        Product__c p = new Product__c(
            Name = 'OnePlus 12 5G',
            Product_Code__c = 'OP12-' + Crypto.getRandomInteger(),
            Category__c = catId,
            Brand__c = 'OnePlus',
            Price__c = 64999.00,
            Discount_Percentage__c = 10.0,
            Tax_Percentage__c = 18.0,
            Stock_Quantity__c = 50,
            Reserved_Quantity__c = 0,
            Reorder_Level__c = 10,
            Product_Status__c = 'Active',
            Rating__c = 4.8
        );
        insert p;
        return p;
    }
    
    public static Coupon__c createCoupon() {
        Coupon__c c = new Coupon__c(
            Name = 'FESTIVE10',
            Coupon_Code__c = 'FESTIVE10-' + Crypto.getRandomInteger(),
            Coupon_Name__c = 'Festive 10% Off',
            Discount_Type__c = 'Percentage',
            Discount_Value__c = 10.0,
            Minimum_Order_Amount__c = 1000.00,
            Maximum_Discount__c = 2000.00,
            Start_Date__c = Date.today().addDays(-5),
            End_Date__c = Date.today().addDays(30),
            Usage_Limit__c = 500,
            Used_Count__c = 0,
            Coupon_Status__c = 'Active'
        );
        insert c;
        return c;
    }
}
