const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const BASE_DIR = path.join(ROOT_DIR, 'force-app', 'main', 'default');
const LWC_DIR = path.join(BASE_DIR, 'lwc');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function writeLWC(componentName, html, js, css = '') {
    const compDir = path.join(LWC_DIR, componentName);
    ensureDir(compDir);
    
    fs.writeFileSync(path.join(compDir, `${componentName}.html`), html.trim() + '\n', 'utf8');
    fs.writeFileSync(path.join(compDir, `${componentName}.js`), js.trim() + '\n', 'utf8');
    if (css) {
        fs.writeFileSync(path.join(compDir, `${componentName}.css`), css.trim() + '\n', 'utf8');
    }
    
    const metaXml = `<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>60.0</apiVersion>
    <isExposed>true</isExposed>
    <masterLabel>${componentName.replace(/([A-Z])/g, ' $1').trim()}</masterLabel>
    <targets>
        <target>lightning__AppPage</target>
        <target>lightning__RecordPage</target>
        <target>lightning__HomePage</target>
        <target>lightningCommunity__Page</target>
        <target>lightningCommunity__Default</target>
    </targets>
</LightningComponentBundle>\n`;
    fs.writeFileSync(path.join(compDir, `${componentName}.js-meta.xml`), metaXml, 'utf8');
}

console.log('Generating Lightning Web Components (LWC)...');

// 1. productSearch LWC
writeLWC('productSearch', `
<template>
    <div class="slds-box slds-theme_default slds-m-bottom_medium search-container">
        <div class="slds-grid slds-wrap slds-gutters_small slds-grid_vertical-align-center">
            <div class="slds-col slds-size_1-1 slds-medium-size_6-12">
                <lightning-input
                    type="search"
                    label="Search Catalog"
                    placeholder="Search by product name, brand, or code..."
                    value={searchTerm}
                    onchange={handleSearchChange}
                    variant="label-hidden"
                ></lightning-input>
            </div>
            <div class="slds-col slds-size_1-1 slds-medium-size_4-12">
                <lightning-combobox
                    label="Filter by Category"
                    value={selectedCategory}
                    options={categoryOptions}
                    onchange={handleCategoryChange}
                    variant="label-hidden"
                    placeholder="All Categories"
                ></lightning-combobox>
            </div>
            <div class="slds-col slds-size_1-1 slds-medium-size_2-12 slds-text-align_right">
                <lightning-button
                    label="Reset Filters"
                    icon-name="utility:refresh"
                    onclick={handleReset}
                    variant="neutral"
                ></lightning-button>
            </div>
        </div>
    </div>
</template>
`, `
import { LightningElement, api, wire, track } from 'lwc';
import getCategories from '@salesforce/apex/ECommerceController.getCategories';

export default class ProductSearch extends LightningElement {
    @track searchTerm = '';
    @track selectedCategory = '';
    @track categoryOptions = [{ label: 'All Categories', value: '' }];

    @wire(getCategories)
    wiredCategories({ error, data }) {
        if (data) {
            this.categoryOptions = [
                { label: 'All Categories', value: '' },
                ...data.map(cat => ({ label: cat.Name, value: cat.Id }))
            ];
        }
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.dispatchFilterEvent();
    }

    handleCategoryChange(event) {
        this.selectedCategory = event.target.value;
        this.dispatchFilterEvent();
    }

    handleReset() {
        this.searchTerm = '';
        this.selectedCategory = '';
        this.dispatchFilterEvent();
    }

    dispatchFilterEvent() {
        this.dispatchEvent(new CustomEvent('filterchange', {
            detail: {
                searchTerm: this.searchTerm,
                categoryId: this.selectedCategory
            }
        }));
    }
}
`, `
.search-container {
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    background: #ffffff;
    border: 1px solid #e5e7eb;
}
`);

// 2. productCard LWC
writeLWC('productCard', `
<template>
    <div class="product-card slds-box slds-theme_default">
        <div class="image-wrapper slds-align_absolute-center">
            <template if:true={product.Product_Image_URL__c}>
                <img src={product.Product_Image_URL__c} alt={product.Name} class="product-img" />
            </template>
            <template if:false={product.Product_Image_URL__c}>
                <div class="placeholder-img slds-align_absolute-center">
                    <lightning-icon icon-name="standard:product" size="large"></lightning-icon>
                </div>
            </template>
            <span class={stockBadgeClass}>{product.Stock_Status__c}</span>
        </div>

        <div class="product-details slds-p-around_small">
            <div class="brand-text slds-text-color_weak slds-text-title_bold">{product.Brand__c}</div>
            <h3 class="product-title slds-truncate" title={product.Name}>{product.Name}</h3>
            
            <div class="rating-bar slds-m-vertical_xx-small">
                <span class="rating-star">★</span>
                <span class="rating-num slds-m-left_xx-small">{product.Rating__c}</span>
            </div>

            <div class="price-container slds-m-vertical_x-small">
                <span class="final-price">₹{formattedFinalPrice}</span>
                <template if:true={hasDiscount}>
                    <span class="original-price slds-m-left_small">₹{product.Price__c}</span>
                    <span class="discount-pill slds-m-left_x-small">-{product.Discount_Percentage__c}%</span>
                </template>
            </div>

            <div class="actions-container slds-grid slds-gutters_xx-small">
                <div class="slds-col slds-size_6-12">
                    <lightning-button
                        label="Details"
                        variant="neutral"
                        onclick={handleViewDetails}
                        class="full-width"
                    ></lightning-button>
                </div>
                <div class="slds-col slds-size_6-12">
                    <lightning-button
                        label="Add to Cart"
                        variant="brand"
                        icon-name="utility:cart"
                        onclick={handleAddToCart}
                        disabled={isOutOfStock}
                        class="full-width"
                    ></lightning-button>
                </div>
            </div>
        </div>
    </div>
</template>
`, `
import { LightningElement, api } from 'lwc';

export default class ProductCard extends LightningElement {
    @api product;

    get formattedFinalPrice() {
        return this.product.Final_Price__c ? this.product.Final_Price__c.toLocaleString('en-IN') : this.product.Price__c;
    }

    get hasDiscount() {
        return this.product.Discount_Percentage__c && this.product.Discount_Percentage__c > 0;
    }

    get isOutOfStock() {
        return this.product.Stock_Status__c === 'Out of Stock';
    }

    get stockBadgeClass() {
        if (this.product.Stock_Status__c === 'Available') return 'stock-badge badge-green';
        if (this.product.Stock_Status__c === 'Low Stock') return 'stock-badge badge-orange';
        return 'stock-badge badge-red';
    }

    handleAddToCart() {
        this.dispatchEvent(new CustomEvent('addtocart', {
            detail: { product: this.product }
        }));
    }

    handleViewDetails() {
        this.dispatchEvent(new CustomEvent('viewdetails', {
            detail: { productId: this.product.Id }
        }));
    }
}
`, `
.product-card {
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    transition: all 0.3s ease;
    overflow: hidden;
    position: relative;
    background: #fff;
    height: 100%;
}
.product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border-color: #0176d3;
}
.image-wrapper {
    height: 180px;
    background: #f8fafc;
    position: relative;
    overflow: hidden;
}
.product-img {
    max-height: 160px;
    object-fit: contain;
    transition: transform 0.3s ease;
}
.product-card:hover .product-img {
    transform: scale(1.05);
}
.stock-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 999px;
    text-transform: uppercase;
}
.badge-green { background: #dcfce7; color: #166534; }
.badge-orange { background: #fef3c7; color: #92400e; }
.badge-red { background: #fee2e2; color: #991b1b; }
.brand-text { font-size: 12px; letter-spacing: 0.5px; text-transform: uppercase; }
.product-title { font-size: 15px; font-weight: 600; color: #1e293b; }
.rating-star { color: #f59e0b; font-size: 14px; }
.final-price { font-size: 18px; font-weight: 700; color: #0f172a; }
.original-price { text-decoration: line-through; color: #94a3b8; font-size: 13px; }
.discount-pill { background: #dbeafe; color: #1e40af; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
.full-width { width: 100%; }
`);

// 3. productCatalog LWC
writeLWC('productCatalog', `
<template>
    <div class="catalog-container">
        <!-- Search & Filter Bar -->
        <c-product-search onfilterchange={handleFilterChange}></c-product-search>

        <!-- Loading Spinner -->
        <template if:true={isLoading}>
            <div class="slds-p-around_xx-large slds-align_absolute-center">
                <lightning-spinner alternative-text="Loading Products" size="medium"></lightning-spinner>
            </div>
        </template>

        <!-- Product Grid -->
        <template if:false={isLoading}>
            <div class="slds-grid slds-wrap slds-gutters">
                <template for:each={products} for:item="prod">
                    <div key={prod.Id} class="slds-col slds-size_1-1 slds-medium-size_4-12 slds-large-size_3-12 slds-m-bottom_medium">
                        <c-product-card
                            product={prod}
                            onaddtocart={handleAddToCart}
                            onviewdetails={handleViewDetails}
                        ></c-product-card>
                    </div>
                </template>
            </div>

            <!-- Empty State -->
            <template if:true={isProductsEmpty}>
                <div class="slds-box slds-theme_default slds-text-align_center slds-p-around_xx-large">
                    <lightning-icon icon-name="utility:search" size="large" class="slds-m-bottom_small"></lightning-icon>
                    <h3 class="slds-text-heading_medium">No products found</h3>
                    <p class="slds-text-color_weak slds-m-top_xx-small">Try clearing your filters or searching for something else.</p>
                </div>
            </template>
        </template>

        <!-- Product Details Modal -->
        <template if:true={selectedProductId}>
            <c-product-details
                product-id={selectedProductId}
                onclose={handleCloseDetails}
                onaddtocart={handleAddToCart}
            ></c-product-details>
        </template>
    </div>
</template>
`, `
import { LightningElement, track, wire } from 'lwc';
import getProducts from '@salesforce/apex/ECommerceController.getProducts';

export default class ProductCatalog extends LightningElement {
    @track products = [];
    @track isLoading = false;
    @track categoryId = '';
    @track searchTerm = '';
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
            maxPrice: 1000000
        })
        .then(data => {
            this.products = data;
            this.isLoading = false;
        })
        .catch(error => {
            console.error('Error loading products', error);
            this.isLoading = false;
        });
    }

    handleFilterChange(event) {
        this.searchTerm = event.detail.searchTerm;
        this.categoryId = event.detail.categoryId;
        this.fetchProducts();
    }

    handleAddToCart(event) {
        this.dispatchEvent(new CustomEvent('addtocart', {
            detail: event.detail
        }));
    }

    handleViewDetails(event) {
        this.selectedProductId = event.detail.productId;
    }

    handleCloseDetails() {
        this.selectedProductId = null;
    }

    get isProductsEmpty() {
        return !this.isLoading && (!this.products || this.products.length === 0);
    }
}
`, `
.catalog-container {
    padding: 1rem 0;
}
`);

// 4. productDetails LWC
writeLWC('productDetails', `
<template>
    <section role="dialog" tabindex="-1" class="slds-modal slds-fade-in-open slds-modal_medium">
        <div class="slds-modal__container">
            <header class="slds-modal__header">
                <button class="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse" title="Close" onclick={handleClose}>
                    <lightning-icon icon-name="utility:close" alternative-text="close" variant="inverse" size="small"></lightning-icon>
                </button>
                <h2 class="slds-text-heading_medium slds-hyphenate">{product.Name}</h2>
            </header>
            <div class="slds-modal__content slds-p-around_large">
                <template if:true={isLoading}>
                    <lightning-spinner alternative-text="Loading details" size="medium"></lightning-spinner>
                </template>
                <template if:false={isLoading}>
                    <div class="slds-grid slds-wrap slds-gutters">
                        <div class="slds-col slds-size_1-1 slds-medium-size_5-12 slds-text-align_center">
                            <img src={product.Product_Image_URL__c} alt={product.Name} class="detail-img" />
                        </div>
                        <div class="slds-col slds-size_1-1 slds-medium-size_7-12">
                            <span class="slds-badge slds-badge_lightest">{product.Brand__c}</span>
                            <div class="price-header slds-m-top_small">
                                <span class="price-tag">₹{product.Final_Price__c}</span>
                                <span class="slds-m-left_small slds-text-color_weak">(Incl. 18% GST)</span>
                            </div>
                            <p class="description slds-m-vertical_medium">{product.Description__c}</p>
                            <div class="stock-info slds-m-bottom_medium">
                                <strong>Availability:</strong> {product.Available_Quantity__c} units in stock
                            </div>
                            <div class="slds-grid slds-grid_vertical-align-center slds-m-top_large">
                                <lightning-input type="number" label="Quantity" value={quantity} min="1" max={product.Available_Quantity__c} onchange={handleQtyChange} class="qty-input"></lightning-input>
                                <lightning-button label="Add to Cart" variant="brand" icon-name="utility:cart" onclick={handleAddToCart} class="slds-m-left_medium slds-m-top_large"></lightning-button>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </section>
    <div class="slds-backdrop slds-backdrop_open"></div>
</template>
`, `
import { LightningElement, api, track } from 'lwc';
import getProductDetails from '@salesforce/apex/ECommerceController.getProductDetails';

export default class ProductDetails extends LightningElement {
    @api productId;
    @track product = {};
    @track isLoading = true;
    @track quantity = 1;

    connectedCallback() {
        getProductDetails({ productId: this.productId })
            .then(data => {
                this.product = data;
                this.isLoading = false;
            })
            .catch(error => {
                console.error(error);
                this.isLoading = false;
            });
    }

    handleQtyChange(event) {
        this.quantity = parseInt(event.target.value, 10) || 1;
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleAddToCart() {
        this.dispatchEvent(new CustomEvent('addtocart', {
            detail: {
                product: this.product,
                quantity: this.quantity
            }
        }));
        this.handleClose();
    }
}
`, `
.detail-img {
    max-height: 280px;
    object-fit: contain;
}
.price-tag {
    font-size: 26px;
    font-weight: 800;
    color: #0f172a;
}
.qty-input {
    width: 100px;
}
`);

// 5. shoppingCart LWC
writeLWC('shoppingCart', `
<template>
    <div class="slds-box slds-theme_default slds-p-around_medium cart-card">
        <h2 class="slds-text-heading_medium slds-m-bottom_medium slds-grid slds-grid_vertical-align-center">
            <lightning-icon icon-name="utility:cart" size="medium" class="slds-m-right_small"></lightning-icon>
            Shopping Cart ({totalCount} items)
        </h2>

        <template if:true={hasItems}>
            <div class="slds-table_responsive">
                <table class="slds-table slds-table_cell-buffer slds-table_bordered">
                    <thead>
                        <tr class="slds-line-height_reset">
                            <th>Product</th>
                            <th>Unit Price</th>
                            <th>Qty</th>
                            <th>Total</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <template for:each={items} for:item="item">
                            <tr key={item.productId}>
                                <td><strong>{item.name}</strong></td>
                                <td>₹{item.price}</td>
                                <td>
                                    <div class="slds-grid slds-grid_vertical-align-center">
                                        <lightning-button-icon icon-name="utility:dash" variant="border-filled" size="small" data-id={item.productId} onclick={handleDecrease}></lightning-button-icon>
                                        <span class="slds-p-horizontal_small">{item.quantity}</span>
                                        <lightning-button-icon icon-name="utility:add" variant="border-filled" size="small" data-id={item.productId} onclick={handleIncrease}></lightning-button-icon>
                                    </div>
                                </td>
                                <td><strong>₹{item.lineTotal}</strong></td>
                                <td>
                                    <lightning-button-icon icon-name="utility:delete" variant="bare" alternative-text="Remove" data-id={item.productId} onclick={handleRemove}></lightning-button-icon>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>

            <!-- Coupon Code Section -->
            <div class="coupon-box slds-m-top_medium slds-grid slds-wrap slds-gutters_small">
                <div class="slds-col slds-size_8-12">
                    <lightning-input type="text" label="Coupon Code" placeholder="e.g. FESTIVE10" value={couponCode} onchange={handleCouponChange}></lightning-input>
                </div>
                <div class="slds-col slds-size_4-12 slds-m-top_large">
                    <lightning-button label="Apply" variant="brand-outline" onclick={handleApplyCoupon}></lightning-button>
                </div>
            </div>
            <template if:true={couponMessage}>
                <p class={couponMsgClass}>{couponMessage}</p>
            </template>

            <!-- Summary Breakdown -->
            <div class="summary-box slds-m-top_large slds-p-around_medium">
                <div class="slds-grid slds-grid_align-spread slds-m-bottom_x-small">
                    <span>Subtotal:</span>
                    <span>₹{subtotal}</span>
                </div>
                <div class="slds-grid slds-grid_align-spread slds-m-bottom_x-small">
                    <span>Discount:</span>
                    <span class="discount-text">- ₹{discount}</span>
                </div>
                <div class="slds-grid slds-grid_align-spread slds-m-bottom_x-small">
                    <span>Tax (GST 18%):</span>
                    <span>₹{tax}</span>
                </div>
                <div class="slds-grid slds-grid_align-spread slds-m-bottom_x-small">
                    <span>Shipping:</span>
                    <span>₹{shipping}</span>
                </div>
                <hr class="slds-m-vertical_small" />
                <div class="slds-grid slds-grid_align-spread grand-total">
                    <strong>Grand Total:</strong>
                    <strong>₹{grandTotal}</strong>
                </div>
                <lightning-button label="Proceed to Checkout" variant="brand" class="slds-m-top_medium full-width" onclick={handleCheckout}></lightning-button>
            </div>
        </template>

        <template if:false={hasItems}>
            <div class="slds-text-align_center slds-p-around_xx-large">
                <lightning-icon icon-name="utility:cart" size="large" class="slds-m-bottom_small"></lightning-icon>
                <p class="slds-text-heading_small">Your shopping cart is empty.</p>
            </div>
        </template>
    </div>
</template>
`, `
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
`, `
.cart-card { border-radius: 12px; }
.summary-box { background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
.discount-text { color: #16a34a; font-weight: 600; }
.grand-total { font-size: 18px; color: #0f172a; }
.full-width { width: 100%; display: block; }
`);

// 6. checkoutPage LWC
writeLWC('checkoutPage', `
<template>
    <div class="slds-box slds-theme_default slds-p-around_large checkout-container">
        <h2 class="slds-text-heading_medium slds-m-bottom_medium">Multi-Step Checkout</h2>

        <lightning-progress-indicator current-step={currentStep} type="path" variant="base">
            <lightning-progress-step label="Customer" value="1"></lightning-progress-step>
            <lightning-progress-step label="Shipping" value="2"></lightning-progress-step>
            <lightning-progress-step label="Summary" value="3"></lightning-progress-step>
            <lightning-progress-step label="Payment" value="4"></lightning-progress-step>
            <lightning-progress-step label="Confirmation" value="5"></lightning-progress-step>
        </lightning-progress-indicator>

        <!-- Step 1: Customer Info -->
        <template if:true={isStep1}>
            <div class="step-content slds-m-top_large">
                <h3 class="slds-text-heading_small slds-m-bottom_small">Customer Information</h3>
                <lightning-input label="Full Name" value={customerName} required onchange={handleNameChange}></lightning-input>
                <lightning-input label="Email Address" type="email" value={email} required onchange={handleEmailChange}></lightning-input>
                <lightning-input label="Phone Number" type="tel" value={phone} required onchange={handlePhoneChange}></lightning-input>
                <lightning-button label="Next: Shipping Address" variant="brand" class="slds-m-top_medium" onclick={goStep2}></lightning-button>
            </div>
        </template>

        <!-- Step 2: Shipping Info -->
        <template if:true={isStep2}>
            <div class="step-content slds-m-top_large">
                <h3 class="slds-text-heading_small slds-m-bottom_small">Shipping & Billing Address</h3>
                <lightning-textarea label="Delivery Address" value={shippingAddress} required onchange={handleShippingChange}></lightning-textarea>
                <lightning-textarea label="Billing Address" value={billingAddress} required onchange={handleBillingChange}></lightning-textarea>
                <div class="slds-m-top_medium">
                    <lightning-button label="Back" variant="neutral" onclick={goStep1} class="slds-m-right_small"></lightning-button>
                    <lightning-button label="Next: Review Summary" variant="brand" onclick={goStep3}></lightning-button>
                </div>
            </div>
        </template>

        <!-- Step 3: Order Review -->
        <template if:true={isStep3}>
            <div class="step-content slds-m-top_large">
                <h3 class="slds-text-heading_small slds-m-bottom_small">Order Review</h3>
                <p><strong>Deliver To:</strong> {customerName}, {shippingAddress}</p>
                <p class="slds-m-top_x-small"><strong>Items Total:</strong> ₹{checkoutData.subtotal}</p>
                <p class="slds-m-top_x-small"><strong>Discount:</strong> - ₹{checkoutData.discount}</p>
                <p class="slds-m-top_x-small"><strong>GST & Shipping:</strong> ₹{checkoutData.tax} + ₹50</p>
                <p class="slds-m-top_small slds-text-heading_small"><strong>Amount Payable: ₹{checkoutData.grandTotal}</strong></p>
                <div class="slds-m-top_medium">
                    <lightning-button label="Back" variant="neutral" onclick={goStep2} class="slds-m-right_small"></lightning-button>
                    <lightning-button label="Next: Payment Method" variant="brand" onclick={goStep4}></lightning-button>
                </div>
            </div>
        </template>

        <!-- Step 4: Payment Selection -->
        <template if:true={isStep4}>
            <div class="step-content slds-m-top_large">
                <h3 class="slds-text-heading_small slds-m-bottom_small">Select Payment Method</h3>
                <lightning-radio-group name="paymentMethod" label="Payment Options" options={paymentOptions} value={selectedPaymentMethod} onchange={handlePaymentSelect}></lightning-radio-group>
                <div class="slds-m-top_large">
                    <lightning-button label="Back" variant="neutral" onclick={goStep3} class="slds-m-right_small"></lightning-button>
                    <lightning-button label="Authorize & Place Order" variant="success" onclick={handlePlaceOrder} disabled={isPlacingOrder}></lightning-button>
                </div>
            </div>
        </template>

        <!-- Step 5: Order Confirmation -->
        <template if:true={isStep5}>
            <div class="step-content slds-m-top_large slds-text-align_center">
                <lightning-icon icon-name="action:approval" size="large" class="slds-m-bottom_medium"></lightning-icon>
                <h3 class="slds-text-heading_large slds-text-color_success">Order Placed Successfully!</h3>
                <p class="slds-m-top_small">Your Order ID is: <strong>{confirmedOrderId}</strong></p>
                <p class="slds-text-color_weak slds-m-top_xx-small">A confirmation receipt has been dispatched to {email}.</p>
                <lightning-button label="Return to Store" variant="brand" class="slds-m-top_large" onclick={handleFinish}></lightning-button>
            </div>
        </template>
    </div>
</template>
`, `
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
`, `
.checkout-container { border-radius: 12px; }
.step-content { max-width: 600px; margin: 2rem auto; }
`);

// 7. adminDashboard LWC
writeLWC('adminDashboard', `
<template>
    <div class="slds-box slds-theme_default admin-dash">
        <div class="slds-grid slds-grid_vertical-align-center slds-m-bottom_large">
            <lightning-icon icon-name="standard:dashboard" size="large" class="slds-m-right_small"></lightning-icon>
            <div>
                <h1 class="slds-text-heading_large">Executive E-Commerce Operations Hub</h1>
                <p class="slds-text-color_weak">Real-time KPI metrics, stock telemetry & sales performance</p>
            </div>
        </div>

        <!-- KPI Metric Cards Grid -->
        <div class="slds-grid slds-wrap slds-gutters">
            <div class="slds-col slds-size_1-1 slds-medium-size_3-12 slds-m-bottom_medium">
                <div class="kpi-card bg-gradient-blue">
                    <span class="kpi-label">TOTAL REVENUE</span>
                    <h2 class="kpi-val">₹{kpis.totalRevenue}</h2>
                </div>
            </div>
            <div class="slds-col slds-size_1-1 slds-medium-size_3-12 slds-m-bottom_medium">
                <div class="kpi-card bg-gradient-purple">
                    <span class="kpi-label">TOTAL ORDERS</span>
                    <h2 class="kpi-val">{kpis.totalOrders}</h2>
                </div>
            </div>
            <div class="slds-col slds-size_1-1 slds-medium-size_3-12 slds-m-bottom_medium">
                <div class="kpi-card bg-gradient-emerald">
                    <span class="kpi-label">TOTAL CUSTOMERS</span>
                    <h2 class="kpi-val">{kpis.totalCustomers}</h2>
                </div>
            </div>
            <div class="slds-col slds-size_1-1 slds-medium-size_3-12 slds-m-bottom_medium">
                <div class="kpi-card bg-gradient-amber">
                    <span class="kpi-label">PENDING FULFILLMENT</span>
                    <h2 class="kpi-val">{kpis.pendingOrders}</h2>
                </div>
            </div>
        </div>

        <div class="slds-grid slds-wrap slds-gutters slds-m-top_small">
            <div class="slds-col slds-size_1-1 slds-medium-size_4-12 slds-m-bottom_medium">
                <div class="kpi-card sub-card">
                    <span class="kpi-label">LOW STOCK ALERTS</span>
                    <h3 class="kpi-val-sub text-danger">{kpis.lowStockProducts} SKUs</h3>
                </div>
            </div>
            <div class="slds-col slds-size_1-1 slds-medium-size_4-12 slds-m-bottom_medium">
                <div class="kpi-card sub-card">
                    <span class="kpi-label">RETURN REQUESTS</span>
                    <h3 class="kpi-val-sub text-warning">{kpis.returnRequests} Pending</h3>
                </div>
            </div>
            <div class="slds-col slds-size_1-1 slds-medium-size_4-12 slds-m-bottom_medium">
                <div class="kpi-card sub-card">
                    <span class="kpi-label">VIP PATRONS</span>
                    <h3 class="kpi-val-sub text-success">{kpis.vipCustomers} Accounts</h3>
                </div>
            </div>
        </div>
    </div>
</template>
`, `
import { LightningElement, track, wire } from 'lwc';
import getAdminKpis from '@salesforce/apex/ECommerceController.getAdminKpis';

export default class AdminDashboard extends LightningElement {
    @track kpis = {
        totalRevenue: '0.00',
        totalOrders: 0,
        totalCustomers: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
        returnRequests: 0,
        vipCustomers: 0
    };

    @wire(getAdminKpis)
    wiredKpis({ error, data }) {
        if (data) {
            this.kpis = {
                ...data,
                totalRevenue: Number(data.totalRevenue).toLocaleString('en-IN')
            };
        }
    }
}
`, `
.admin-dash { border-radius: 12px; }
.kpi-card {
    border-radius: 12px;
    padding: 1.5rem;
    color: #fff;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
}
.bg-gradient-blue { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); }
.bg-gradient-purple { background: linear-gradient(135deg, #6b21a8 0%, #a855f7 100%); }
.bg-gradient-emerald { background: linear-gradient(135deg, #065f46 0%, #10b981 100%); }
.bg-gradient-amber { background: linear-gradient(135deg, #b45309 0%, #f59e0b 100%); }
.sub-card { background: #f8fafc; border: 1px solid #e2e8f0; color: #1e293b; }
.kpi-label { font-size: 11px; font-weight: 700; letter-spacing: 0.8px; opacity: 0.9; }
.kpi-val { font-size: 28px; font-weight: 800; margin-top: 0.5rem; }
.kpi-val-sub { font-size: 22px; font-weight: 700; margin-top: 0.3rem; }
.text-danger { color: #dc2626; }
.text-warning { color: #d97706; }
.text-success { color: #16a34a; }
`);

// 8. ecommerceDashboard (Root Container LWC)
writeLWC('ecommerceDashboard', `
<template>
    <div class="ecommerce-app">
        <!-- Top Navigation Bar -->
        <header class="app-header slds-grid slds-grid_vertical-align-center slds-p-around_medium">
            <div class="slds-grid slds-grid_vertical-align-center logo-area">
                <lightning-icon icon-name="standard:store" size="medium" class="slds-m-right_small"></lightning-icon>
                <div>
                    <h1 class="brand-heading">BharatMart E-Commerce CRM</h1>
                    <span class="sub-text">Salesforce Customer Management & Sales Automation System</span>
                </div>
            </div>
            <div class="slds-col_bump-left nav-actions slds-grid slds-grid_vertical-align-center">
                <lightning-button-group>
                    <lightning-button label="Storefront" variant={storefrontVariant} icon-name="utility:shop" onclick={navStorefront}></lightning-button>
                    <lightning-button label={cartLabel} variant={cartVariant} icon-name="utility:cart" onclick={navCart}></lightning-button>
                    <lightning-button label="Analytics & Operations" variant={adminVariant} icon-name="utility:graph" onclick={navAdmin}></lightning-button>
                </lightning-button-group>
            </div>
        </header>

        <!-- View Content Router -->
        <main class="slds-p-around_medium">
            <template if:true={isStorefrontView}>
                <c-product-catalog onaddtocart={handleAddToCart}></c-product-catalog>
            </template>

            <template if:true={isCartView}>
                <c-shopping-cart
                    items={cartItems}
                    onupdateqty={handleUpdateQty}
                    onremoveitem={handleRemoveItem}
                    onstartcheckout={handleStartCheckout}
                ></c-shopping-cart>
            </template>

            <template if:true={isCheckoutView}>
                <c-checkout-page
                    items={cartItems}
                    checkout-data={checkoutData}
                    oncheckoutcomplete={handleCheckoutComplete}
                ></c-checkout-page>
            </template>

            <template if:true={isAdminView}>
                <c-admin-dashboard></c-admin-dashboard>
            </template>
        </main>
    </div>
</template>
`, `
import { LightningElement, track } from 'lwc';

export default class EcommerceDashboard extends LightningElement {
    @track currentView = 'storefront'; // 'storefront' | 'cart' | 'checkout' | 'admin'
    @track cartItems = [];
    @track checkoutData = {};

    get isStorefrontView() { return this.currentView === 'storefront'; }
    get isCartView() { return this.currentView === 'cart'; }
    get isCheckoutView() { return this.currentView === 'checkout'; }
    get isAdminView() { return this.currentView === 'admin'; }

    get storefrontVariant() { return this.isStorefrontView ? 'brand' : 'neutral'; }
    get cartVariant() { return (this.isCartView || this.isCheckoutView) ? 'brand' : 'neutral'; }
    get adminVariant() { return this.isAdminView ? 'brand' : 'neutral'; }

    get cartLabel() {
        const total = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
        return 'Cart (' + total + ')';
    }

    navStorefront() { this.currentView = 'storefront'; }
    navCart() { this.currentView = 'cart'; }
    navAdmin() { this.currentView = 'admin'; }

    handleAddToCart(event) {
        const product = event.detail.product;
        const qty = event.detail.quantity || 1;
        
        const existing = this.cartItems.find(item => item.productId === product.Id);
        if (existing) {
            existing.quantity += qty;
            existing.lineTotal = (existing.quantity * existing.price).toFixed(2);
            this.cartItems = [...this.cartItems];
        } else {
            const price = product.Final_Price__c || product.Price__c;
            this.cartItems = [...this.cartItems, {
                productId: product.Id,
                name: product.Name,
                price: price,
                quantity: qty,
                lineTotal: (qty * price).toFixed(2)
            }];
        }
    }

    handleUpdateQty(event) {
        const { productId, delta } = event.detail;
        const item = this.cartItems.find(i => i.productId === productId);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                this.cartItems = this.cartItems.filter(i => i.productId !== productId);
            } else {
                item.lineTotal = (item.quantity * item.price).toFixed(2);
                this.cartItems = [...this.cartItems];
            }
        }
    }

    handleRemoveItem(event) {
        const { productId } = event.detail;
        this.cartItems = this.cartItems.filter(i => i.productId !== productId);
    }

    handleStartCheckout(event) {
        this.checkoutData = event.detail;
        this.currentView = 'checkout';
    }

    handleCheckoutComplete() {
        this.cartItems = [];
        this.checkoutData = {};
        this.currentView = 'storefront';
    }
}
`, `
.ecommerce-app {
    background: #f1f5f9;
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.app-header {
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}
.brand-heading {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.2;
}
.sub-text {
    font-size: 12px;
    color: #64748b;
}
`);

console.log('All Lightning Web Components Generated Successfully!');
