@isTest
private class CouponServiceTest {
    @isTest
    static void testValidCoupon() {
        Coupon__c c = ECommerceTestFactory.createCoupon();
        
        Test.startTest();
        CouponService.CouponResult res = CouponService.validateAndApplyCoupon(c.Coupon_Code__c, 5000.00);
        Test.stopTest();
        
        System.assertEquals(true, res.isValid, 'Coupon should be valid');
        System.assertEquals(500.00, res.discountAmount, '10% of 5000 is 500');
    }
    
    @isTest
    static void testInvalidCoupon() {
        Test.startTest();
        CouponService.CouponResult res = CouponService.validateAndApplyCoupon('NONEXISTENT', 5000.00);
        Test.stopTest();
        
        System.assertEquals(false, res.isValid, 'Non-existent coupon must be invalid');
    }
}
