import { LightningElement, api, track } from 'lwc';
import applyCouponApex from '@salesforce/apex/ECommerceController.applyCoupon';

export default class ShoppingCart extends LightningElement {
    @api items = [];
    @track couponCode = '';
    @track discount = 0;
    @track couponMessage = '';
    @track isCouponValid = false;
    shipping = 50.00;

    get hasItems() {
        return this.items && this.items.length > 0;
    }

    get totalCount() {
        return this.items.reduce((acc, item) => acc + item.quantity, 0);
    }

    get subtotal() {
        return this.items.reduce((acc, item) => acc + (item.quantity * item.price), 0).toFixed(2);
    }

    get tax() {
        return (parseFloat(this.subtotal) * 0.18).toFixed(2);
    }

    get grandTotal() {
        const total = parseFloat(this.subtotal) - this.discount + parseFloat(this.tax) + this.shipping;
        return Math.max(0, total).toFixed(2);
    }

    get couponMsgClass() {
        return this.isCouponValid ? 'slds-text-color_success slds-m-top_x-small' : 'slds-text-color_error slds-m-top_x-small';
    }

    handleIncrease(event) {
        const id = event.target.dataset.id;
        this.dispatchEvent(new CustomEvent('updateqty', { detail: { productId: id, delta: 1 } }));
    }

    handleDecrease(event) {
        const id = event.target.dataset.id;
        this.dispatchEvent(new CustomEvent('updateqty', { detail: { productId: id, delta: -1 } }));
    }

    handleRemove(event) {
        const id = event.target.dataset.id;
        this.dispatchEvent(new CustomEvent('removeitem', { detail: { productId: id } }));
    }

    handleCouponChange(event) {
        this.couponCode = event.target.value;
    }

    handleApplyCoupon() {
        applyCouponApex({ couponCode: this.couponCode, subtotal: parseFloat(this.subtotal) })
            .then(res => {
                this.isCouponValid = res.isValid;
                this.couponMessage = res.message;
                if (res.isValid) {
                    this.discount = res.discountAmount;
                } else {
                    this.discount = 0;
                }
            })
            .catch(err => {
                this.couponMessage = err.body ? err.body.message : 'Error validating coupon';
                this.isCouponValid = false;
            });
    }

    handleCheckout() {
        this.dispatchEvent(new CustomEvent('startcheckout', {
            detail: {
                subtotal: this.subtotal,
                discount: this.discount,
                tax: this.tax,
                grandTotal: this.grandTotal,
                couponCode: this.couponCode
            }
        }));
    }
}
