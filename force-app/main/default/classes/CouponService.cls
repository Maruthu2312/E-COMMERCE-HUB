public inherited sharing class CouponService {
    public class CouponResult {
        @AuraEnabled public Boolean isValid;
        @AuraEnabled public Decimal discountAmount;
        @AuraEnabled public String message;
        @AuraEnabled public Id couponId;
    }
    
    public static CouponResult validateAndApplyCoupon(String couponCode, Decimal subtotal) {
        CouponResult result = new CouponResult();
        result.isValid = false;
        result.discountAmount = 0.0;
        
        if (String.isBlank(couponCode)) {
            result.message = 'Please enter a coupon code.';
            return result;
        }
        
        List<Coupon__c> coupons = [
            SELECT Id, Name, Coupon_Code__c, Coupon_Name__c, Discount_Type__c, Discount_Value__c,
                   Minimum_Order_Amount__c, Maximum_Discount__c, Start_Date__c, End_Date__c,
                   Usage_Limit__c, Used_Count__c, Coupon_Status__c
            FROM Coupon__c
            WHERE Coupon_Code__c = :couponCode
            LIMIT 1
        ];
        
        if (coupons.isEmpty()) {
            result.message = 'Coupon code "' + couponCode + '" not found.';
            return result;
        }
        
        Coupon__c c = coupons[0];
        Date today = Date.today();
        
        if (c.Coupon_Status__c != 'Active') {
            result.message = 'Coupon code "' + couponCode + '" is inactive.';
            return result;
        }
        if (c.Start_Date__c != null && today < c.Start_Date__c) {
            result.message = 'Coupon is not valid yet.';
            return result;
        }
        if (c.End_Date__c != null && today > c.End_Date__c) {
            result.message = 'Coupon has expired.';
            return result;
        }
        if (c.Minimum_Order_Amount__c != null && subtotal < c.Minimum_Order_Amount__c) {
            result.message = 'Minimum cart value of ₹' + c.Minimum_Order_Amount__c + ' required to use this coupon.';
            return result;
        }
        if (c.Usage_Limit__c != null && c.Used_Count__c >= c.Usage_Limit__c) {
            result.message = 'Coupon usage limit has been exceeded.';
            return result;
        }
        
        Decimal discount = 0;
        if (c.Discount_Type__c == 'Percentage') {
            discount = (subtotal * (c.Discount_Value__c / 100)).setScale(2);
            if (c.Maximum_Discount__c != null && discount > c.Maximum_Discount__c) {
                discount = c.Maximum_Discount__c;
            }
        } else {
            discount = Math.min(subtotal, c.Discount_Value__c);
        }
        
        result.isValid = true;
        result.discountAmount = discount;
        result.couponId = c.Id;
        result.message = 'Coupon "' + c.Coupon_Code__c + '" applied successfully! Saved ₹' + discount;
        return result;
    }
}
