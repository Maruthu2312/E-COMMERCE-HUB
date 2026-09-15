import { LightningElement, api, track } from 'lwc';

export default class ProductCard extends LightningElement {
    @api product = {};
    @api isWishlisted = false;
    @track imageLoadFailed = false;

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

    get categoryFallbackClass() {
        const cat = (this.productCategoryName || '').toLowerCase();
        if (cat.includes('mobile')) return 'fallback-card bg-theme-blue';
        if (cat.includes('laptop')) return 'fallback-card bg-theme-purple';
        if (cat.includes('audio')) return 'fallback-card bg-theme-indigo';
        if (cat.includes('appliance')) return 'fallback-card bg-theme-teal';
        if (cat.includes('fashion')) return 'fallback-card bg-theme-pink';
        if (cat.includes('kitchen')) return 'fallback-card bg-theme-amber';
        if (cat.includes('fitness')) return 'fallback-card bg-theme-emerald';
        if (cat.includes('book')) return 'fallback-card bg-theme-rose';
        return 'fallback-card bg-theme-blue';
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
        return this.product.Rating__c ? Number(this.product.Rating__c).toFixed(1) : '4.5';
    }

    get hasDiscount() {
        return this.product.Discount_Percentage__c && this.product.Discount_Percentage__c > 0;
    }

    get isOutOfStock() {
        return this.product.Stock_Status__c === 'Out of Stock' || (this.product.Available_Quantity__c && this.product.Available_Quantity__c <= 0);
    }

    get stockSubtext() {
        if (this.isOutOfStock) return 'Sold out';
        if (this.product.Stock_Status__c === 'Low Stock') return `Only ${this.product.Available_Quantity__c} left!`;
        return 'In Stock';
    }

    get stockBadgeClass() {
        if (this.isOutOfStock) return 'stock-badge badge-red';
        if (this.product.Stock_Status__c === 'Low Stock') return 'stock-badge badge-orange';
        return 'stock-badge badge-green';
    }

    get wishlistBtnClass() {
        return this.isWishlisted ? 'wishlist-btn wishlisted' : 'wishlist-btn';
    }

    get wishlistIcon() {
        return this.isWishlisted ? '❤️' : '🤍';
    }

    get addToCartLabel() {
        return this.isOutOfStock ? 'Sold Out' : 'Add to Cart';
    }

    get addToCartBtnClass() {
        return this.isOutOfStock ? 'btn-add-cart disabled' : 'btn-add-cart';
    }

    handleToggleWishlist(e) {
        e.stopPropagation();
        this.isWishlisted = !this.isWishlisted;
        this.dispatchEvent(new CustomEvent('togglewishlist', {
            bubbles: true,
            composed: true,
            detail: {
                productId: this.product.Id,
                isWishlisted: this.isWishlisted,
                product: this.product
            }
        }));
    }

    handleAddToCart(e) {
        e.stopPropagation();
        if (this.isOutOfStock) return;
        this.dispatchEvent(new CustomEvent('addtocart', {
            bubbles: true,
            composed: true,
            detail: { product: this.product, quantity: 1 }
        }));
    }

    handleViewDetails() {
        this.dispatchEvent(new CustomEvent('viewdetails', {
            bubbles: true,
            composed: true,
            detail: { productId: this.product.Id }
        }));
    }
}
