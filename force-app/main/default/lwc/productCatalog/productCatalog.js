import { LightningElement, track, api } from 'lwc';
import getProducts from '@salesforce/apex/ECommerceController.getProducts';

export default class ProductCatalog extends LightningElement {
    @api wishlistedIds = [];
    @track rawProducts = [];
    @track isLoading = false;
    @track categoryId = '';
    @track searchTerm = '';
    @track sortBy = 'featured';
    @track inStockOnly = false;
    @track selectedProductId = null;

    connectedCallback() {
        this.fetchProducts();
    }

    fetchProducts() {
        this.isLoading = true;
        getProducts({
            categoryId: this.categoryId,
            searchTerm: this.searchTerm,
            minPrice: 0,
            maxPrice: 10000000
        })
        .then(data => {
            this.rawProducts = data || [];
            this.isLoading = false;
        })
        .catch(error => {
            console.error('Error loading products', error);
            this.isLoading = false;
        });
    }

    get processedProducts() {
        let list = [...this.rawProducts];

        // In-stock filtering
        if (this.inStockOnly) {
            list = list.filter(p => p.Stock_Status__c !== 'Out of Stock' && (p.Available_Quantity__c && p.Available_Quantity__c > 0));
        }

        // Sorting
        if (this.sortBy === 'price-asc') {
            list.sort((a, b) => (a.Final_Price__c || a.Price__c) - (b.Final_Price__c || b.Price__c));
        } else if (this.sortBy === 'price-desc') {
            list.sort((a, b) => (b.Final_Price__c || b.Price__c) - (a.Final_Price__c || a.Price__c));
        } else if (this.sortBy === 'rating-desc') {
            list.sort((a, b) => (b.Rating__c || 0) - (a.Rating__c || 0));
        } else if (this.sortBy === 'discount-desc') {
            list.sort((a, b) => (b.Discount_Percentage__c || 0) - (a.Discount_Percentage__c || 0));
        }

        // Attach wishlisted flag
        const wishSet = new Set(this.wishlistedIds);
        return list.map(p => ({
            ...p,
            isWishlisted: wishSet.has(p.Id)
        }));
    }

    get isProductsEmpty() {
        return !this.isLoading && (!this.processedProducts || this.processedProducts.length === 0);
    }

    handleFilterChange(event) {
        const { searchTerm, categoryId, sortBy, inStockOnly } = event.detail;
        const needsRefetch = (searchTerm !== this.searchTerm) || (categoryId !== this.categoryId);
        this.searchTerm = searchTerm;
        this.categoryId = categoryId;
        this.sortBy = sortBy;
        this.inStockOnly = inStockOnly;

        if (needsRefetch) {
            this.fetchProducts();
        }
    }

    handleAddToCart(event) {
        this.dispatchEvent(new CustomEvent('addtocart', {
            bubbles: true,
            composed: true,
            detail: event.detail
        }));
    }

    handleToggleWishlist(event) {
        this.dispatchEvent(new CustomEvent('togglewishlist', {
            bubbles: true,
            composed: true,
            detail: event.detail
        }));
    }

    handleViewDetails(event) {
        this.selectedProductId = event.detail.productId;
    }

    handleCloseDetails() {
        this.selectedProductId = null;
    }
}
