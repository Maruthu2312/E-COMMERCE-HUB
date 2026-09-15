import { LightningElement, api, track } from 'lwc';
import placeOrderApex from '@salesforce/apex/ECommerceController.placeOrder';
import registerCustomerApex from '@salesforce/apex/CustomerService.registerCustomer';

export default class CheckoutPage extends LightningElement {
    @api items = [];
    @api checkoutData = {};
    @track currentStep = '1';

    @track customerName = 'Priya Patel';
    @track email = 'priya.patel@example.com';
    @track phone = '+91 9123456780';
    @track shippingAddress = 'Flat 402, Lotus Towers, Whitefield, Bengaluru, Karnataka - 560066';
    @track billingAddress = 'Flat 402, Lotus Towers, Whitefield, Bengaluru, Karnataka - 560066';
    @track selectedPaymentMethod = 'UPI';
    @track isPlacingOrder = false;
    @track confirmedOrderId = '';

    paymentOptions = [
        { label: 'UPI (Google Pay / PhonePe / Paytm)', value: 'UPI' },
        { label: 'Credit / Debit Card', value: 'Credit Card' },
        { label: 'Net Banking', value: 'Net Banking' },
        { label: 'Cash on Delivery (COD)', value: 'Cash on Delivery' }
    ];

    get isStep1() { return this.currentStep === '1'; }
    get isStep2() { return this.currentStep === '2'; }
    get isStep3() { return this.currentStep === '3'; }
    get isStep4() { return this.currentStep === '4'; }
    get isStep5() { return this.currentStep === '5'; }

    handleNameChange(e) { this.customerName = e.target.value; }
    handleEmailChange(e) { this.email = e.target.value; }
    handlePhoneChange(e) { this.phone = e.target.value; }
    handleShippingChange(e) { this.shippingAddress = e.target.value; }
    handleBillingChange(e) { this.billingAddress = e.target.value; }
    handlePaymentSelect(e) { this.selectedPaymentMethod = e.target.value; }

    goStep1() { this.currentStep = '1'; }
    goStep2() { this.currentStep = '2'; }
    goStep3() { this.currentStep = '3'; }
    goStep4() { this.currentStep = '4'; }

    handlePlaceOrder() {
        this.isPlacingOrder = true;
        
        // 1. Create or register customer
        registerCustomerApex({
            name: this.customerName,
            email: this.email,
            phone: this.phone,
            street: this.shippingAddress,
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560066'
        })
        .then(cust => {
            return this.executeOrder(cust.Id);
        })
        .catch(() => {
            // In case customer already exists, fetch or proceed
            return this.executeOrder(null);
        });
    }

    executeOrder(customerId) {
        const orderItemsPayload = this.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
        }));

        placeOrderApex({
            customerId: customerId,
            itemsJson: JSON.stringify(orderItemsPayload),
            shippingAddress: this.shippingAddress,
            billingAddress: this.billingAddress,
            paymentMethod: this.selectedPaymentMethod,
            couponCode: this.checkoutData.couponCode || ''
        })
        .then(orderId => {
            this.confirmedOrderId = orderId;
            this.currentStep = '5';
            this.isPlacingOrder = false;
        })
        .catch(err => {
            console.error('Order placement failed', err);
            this.isPlacingOrder = false;
        });
    }

    handleFinish() {
        this.dispatchEvent(new CustomEvent('checkoutcomplete'));
    }
}
