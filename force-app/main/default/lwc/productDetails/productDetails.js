import { LightningElement, api, track } from 'lwc';
import getProductDetails from '@salesforce/apex/ECommerceController.getProductDetails';

export default class ProductDetails extends LightningElement {
    @api productId;
    @track product = {};
    @track isLoading = true;
    @track quantity = 1;
    @track imageLoadFailed = false;

    connectedCallback() {
        getProductDetails({ productId: this.productId })
            .then(data => {
                this.product = data;
                this.isLoading = false;
            })
            .catch(error => {
                console.error('Failed to load product details', error);
                this.isLoading = false;
            });
    }

    get showImage() {
        return this.product.Product_Image_URL__c && !this.imageLoadFailed;
    }

    handleImageError() {
        this.imageLoadFailed = true;
    }

    get productCategoryName() {
        return (this.product.Category__r && this.product.Category__r.Name) ? this.product.Category__r.Name : 'General';
    }

    get categoryEmoji() {
        const cat = (this.productCategoryName || '').toLowerCase();
        if (cat.includes('mobile') || cat.includes('phone')) return '📱';
        if (cat.includes('laptop') || cat.includes('computer')) return '💻';
        if (cat.includes('audio') || cat.includes('wearable')) return '🎧';
        if (cat.includes('appliance') || cat.includes('home')) return '🏠';
        if (cat.includes('fashion')) return '👕';
        if (cat.includes('kitchen')) return '🍳';
        if (cat.includes('fitness') || cat.includes('sport')) return '🏋️';
        if (cat.includes('book')) return '📚';
        return '🛍️';
    }

    get formattedFinalPrice() {
        const p = this.product.Final_Price__c || this.product.Price__c || 0;
        return Number(p).toLocaleString('en-IN');
    }

    get formattedOriginalPrice() {
        const p = this.product.Price__c || 0;
        return Number(p).toLocaleString('en-IN');
    }

    get formattedRating() {
        return this.product.Rating__c ? Number(this.product.Rating__c).toFixed(1) : '4.8';
    }

    get hasDiscount() {
        return this.product.Discount_Percentage__c && this.product.Discount_Percentage__c > 0;
    }

    get isOutOfStock() {
        return this.product.Stock_Status__c === 'Out of Stock' || (this.product.Available_Quantity__c && this.product.Available_Quantity__c <= 0);
    }

    get stockBadgeClass() {
        if (this.isOutOfStock) return 'modal-stock-badge badge-red';
        if (this.product.Stock_Status__c === 'Low Stock') return 'modal-stock-badge badge-orange';
        return 'modal-stock-badge badge-green';
    }

    get isMinQty() {
        return this.quantity <= 1;
    }

    get isMaxQty() {
        const max = this.product.Available_Quantity__c || 99;
        return this.quantity >= max;
    }

    get addToCartLabel() {
        return this.isOutOfStock ? 'Currently Out of Stock' : `Add ${this.quantity} to Cart`;
    }

    get addToCartBtnClass() {
        return this.isOutOfStock ? 'btn-modal-cart disabled' : 'btn-modal-cart';
    }

    incrementQty() {
        if (!this.isMaxQty) this.quantity++;
    }

    decrementQty() {
        if (!this.isMinQty) this.quantity--;
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleAddToCart() {
        if (this.isOutOfStock) return;
        this.dispatchEvent(new CustomEvent('addtocart', {
            detail: {
                product: this.product,
                quantity: this.quantity
            }
        }));
        this.handleClose();
    }
}
