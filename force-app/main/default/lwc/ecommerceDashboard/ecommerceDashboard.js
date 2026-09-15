import { LightningElement, track, wire } from 'lwc';
import getWishlistItems from '@salesforce/apex/ECommerceController.getWishlistItems';
import toggleWishlist from '@salesforce/apex/ECommerceController.toggleWishlist';
import getAllRecentOrders from '@salesforce/apex/ECommerceController.getAllRecentOrders';
import createOrderReturn from '@salesforce/apex/ECommerceController.createOrderReturn';
import { refreshApex } from '@salesforce/apex';

export default class EcommerceDashboard extends LightningElement {
    @track currentView = 'storefront'; // 'storefront' | 'wishlist' | 'orders' | 'cart' | 'checkout' | 'admin'
    @track cartItems = [];
    @track checkoutData = {};

    // Wishlist state
    @track rawWishlist = [];
    @track isWishlistLoading = false;
    wiredWishlistResult;

    // Order Tracking state
    @track rawOrders = [];
    @track isOrdersLoading = false;
    @track orderSearchTerm = '';
    @track orderStatusFilter = 'all'; // 'all' | 'pending' | 'delivered'
    wiredOrdersResult;

    // Return Modal state
    @track showReturnModal = false;
    @track activeReturnOrder = {};
    @track returnReason = 'Defective Product';
    @track returnComments = '';
    @track isSubmittingReturn = false;

    // Toast notification banner state
    @track toast = {
        visible: false,
        title: '',
        message: '',
        icon: '✅',
        type: 'success'
    };
    toastTimeout;

    returnReasonOptions = [
        { label: 'Defective or Damaged Product', value: 'Defective Product' },
        { label: 'Wrong Item or Variant Received', value: 'Wrong Item' },
        { label: 'Quality Does Not Meet Expectation', value: 'Quality Issue' },
        { label: 'Changed Mind / No Longer Needed', value: 'Changed Mind' },
        { label: 'Arrived Too Late', value: 'Late Delivery' }
    ];

    // --- WIRED APEX SERVICES ---

    @wire(getWishlistItems, { customerId: null })
    wiredWishlist(result) {
        this.wiredWishlistResult = result;
        const { error, data } = result;
        if (data) {
            this.rawWishlist = data;
        } else if (error) {
            console.error('Error fetching wishlist', error);
        }
    }

    @wire(getAllRecentOrders)
    wiredOrders(result) {
        this.wiredOrdersResult = result;
        const { error, data } = result;
        if (data) {
            this.rawOrders = data;
        } else if (error) {
            console.error('Error fetching orders', error);
        }
    }

    // --- NAVIGATION GETTERS ---

    get isStorefrontView() { return this.currentView === 'storefront'; }
    get isWishlistView() { return this.currentView === 'wishlist'; }
    get isOrdersView() { return this.currentView === 'orders'; }
    get isCartView() { return this.currentView === 'cart'; }
    get isCheckoutView() { return this.currentView === 'checkout'; }
    get isAdminView() { return this.currentView === 'admin'; }

    get storefrontBtnClass() { return this.isStorefrontView ? 'nav-pill active' : 'nav-pill'; }
    get wishlistBtnClass() { return this.isWishlistView ? 'nav-pill active' : 'nav-pill'; }
    get ordersBtnClass() { return this.isOrdersView ? 'nav-pill active' : 'nav-pill'; }
    get cartBtnClass() { return (this.isCartView || this.isCheckoutView) ? 'nav-pill active' : 'nav-pill'; }
    get adminBtnClass() { return this.isAdminView ? 'nav-pill active' : 'nav-pill'; }

    navStorefront() { this.currentView = 'storefront'; }
    navWishlist() { 
        this.currentView = 'wishlist'; 
        this.refreshWishlist();
    }
    navOrders() { 
        this.currentView = 'orders'; 
        this.refreshOrders();
    }
    navCart() { this.currentView = 'cart'; }
    navAdmin() { this.currentView = 'admin'; }

    // --- WISHLIST COMPUTED ---

    get wishlistCount() {
        return this.rawWishlist ? this.rawWishlist.length : 0;
    }

    get hasWishlistItems() {
        return this.wishlistCount > 0;
    }

    get wishlistProductIds() {
        return this.rawWishlist ? this.rawWishlist.map(w => w.Product__c) : [];
    }

    get wishlistItems() {
        return this.rawWishlist.map(w => {
            const p = w.Product__r || {};
            const price = p.Final_Price__c || p.Price__c || 0;
            const stockStatus = p.Stock_Status__c || 'In Stock';
            return {
                ...w,
                categoryName: (p.Category__r && p.Category__r.Name) ? p.Category__r.Name : 'General',
                formattedPrice: Number(price).toLocaleString('en-IN'),
                formattedRating: p.Rating__c ? Number(p.Rating__c).toFixed(1) : '4.5',
                stockClass: stockStatus === 'Out of Stock' ? 'stock-pill pill-red' : (stockStatus === 'Low Stock' ? 'stock-pill pill-orange' : 'stock-pill pill-green')
            };
        });
    }

    refreshWishlist() {
        if (this.wiredWishlistResult) {
            refreshApex(this.wiredWishlistResult);
        }
    }

    handleWishlistToggle(event) {
        const { productId, isWishlisted } = event.detail;
        toggleWishlist({ customerId: null, productId: productId })
            .then(added => {
                this.refreshWishlist();
                if (added) {
                    this.showBannerToast('Saved to Wishlist!', 'Item added to your favorites ❤️', 'success', '❤️');
                } else {
                    this.showBannerToast('Removed from Wishlist', 'Item removed from your favorites.', 'info', '🗑️');
                }
            })
            .catch(err => {
                console.error('Toggle wishlist error', err);
            });
    }

    handleRemoveFromWishlist(event) {
        const productId = event.currentTarget.dataset.id;
        toggleWishlist({ customerId: null, productId: productId })
            .then(() => {
                this.refreshWishlist();
                this.showBannerToast('Item Removed', 'Product removed from your wishlist.', 'info', '🗑️');
            })
            .catch(err => {
                console.error('Remove wishlist error', err);
            });
    }

    handleMoveWishlistToCart(event) {
        const productId = event.currentTarget.dataset.id;
        const item = this.rawWishlist.find(w => w.Product__c === productId);
        if (item && item.Product__r) {
            const product = item.Product__r;
            this.handleAddToCart({ detail: { product: product, quantity: 1 } });
            this.showBannerToast('Added to Cart!', `${product.Name} is now in your shopping cart.`, 'success', '🛒');
        }
    }

    // --- ORDERS COMPUTED & ACTIONS ---

    get ordersCount() {
        return this.rawOrders ? this.rawOrders.length : 0;
    }

    get hasOrders() {
        return this.filteredOrders && this.filteredOrders.length > 0;
    }

    get filterAllClass() { return this.orderStatusFilter === 'all' ? 'filter-pill active' : 'filter-pill'; }
    get filterPendingClass() { return this.orderStatusFilter === 'pending' ? 'filter-pill active' : 'filter-pill'; }
    get filterDeliveredClass() { return this.orderStatusFilter === 'delivered' ? 'filter-pill active' : 'filter-pill'; }

    handleOrderStatusFilter(event) {
        this.orderStatusFilter = event.currentTarget.dataset.filter;
    }

    handleOrderSearchChange(event) {
        this.orderSearchTerm = event.target.value || '';
    }

    refreshOrders() {
        this.isOrdersLoading = true;
        if (this.wiredOrdersResult) {
            refreshApex(this.wiredOrdersResult).finally(() => {
                this.isOrdersLoading = false;
            });
        } else {
            this.isOrdersLoading = false;
        }
    }

    get filteredOrders() {
        if (!this.rawOrders) return [];
        let list = [...this.rawOrders];

        // Filter by tab status
        if (this.orderStatusFilter === 'pending') {
            list = list.filter(o => o.Order_Status__c !== 'Delivered' && o.Order_Status__c !== 'Completed' && o.Order_Status__c !== 'Cancelled');
        } else if (this.orderStatusFilter === 'delivered') {
            list = list.filter(o => o.Order_Status__c === 'Delivered' || o.Order_Status__c === 'Completed');
        }

        // Search term
        if (this.orderSearchTerm && this.orderSearchTerm.trim()) {
            const term = this.orderSearchTerm.toLowerCase().trim();
            list = list.filter(o => {
                const name = (o.Name || '').toLowerCase();
                const cust = (o.Customer__r && o.Customer__r.Customer_Name__c) ? o.Customer__r.Customer_Name__c.toLowerCase() : '';
                const city = (o.Customer__r && o.Customer__r.City__c) ? o.Customer__r.City__c.toLowerCase() : '';
                return name.includes(term) || cust.includes(term) || city.includes(term);
            });
        }

        return list.map(o => {
            const status = o.Order_Status__c || 'Draft';
            const isDelivered = status === 'Delivered' || status === 'Completed';
            const isShipped = status === 'Shipped' || isDelivered;
            const isConfirmed = status === 'Confirmed' || status === 'Processing' || isShipped;

            // Stepper Classes
            const step1Class = 'stepper-step completed';
            const line1Class = isConfirmed ? 'stepper-line active' : 'stepper-line';
            const step2Class = isConfirmed ? 'stepper-step completed' : 'stepper-step pending';
            const line2Class = isShipped ? 'stepper-line active' : 'stepper-line';
            const step3Class = isShipped ? 'stepper-step completed' : 'stepper-step pending';
            const line3Class = isDelivered ? 'stepper-line active' : 'stepper-line';
            const step4Class = isDelivered ? 'stepper-step completed' : 'stepper-step pending';

            // Shipment Telemetry
            const shipments = o.Shipments__r || [];
            const shipment = shipments.length > 0 ? shipments[0] : null;

            // Items
            const items = (o.Order_Items__r || []).map(it => ({
                ...it,
                formattedPrice: Number(it.Unit_Price__c || 0).toLocaleString('en-IN')
            }));

            // Badge styling
            let statusBadgeClass = 'order-badge badge-blue';
            if (isDelivered) statusBadgeClass = 'order-badge badge-green';
            else if (status === 'Shipped') statusBadgeClass = 'order-badge badge-purple';
            else if (status === 'Processing' || status === 'Confirmed') statusBadgeClass = 'order-badge badge-amber';
            else if (status === 'Cancelled') statusBadgeClass = 'order-badge badge-red';

            return {
                ...o,
                customerName: (o.Customer__r && o.Customer__r.Customer_Name__c) ? o.Customer__r.Customer_Name__c : 'Valued Customer',
                customerCity: (o.Customer__r && o.Customer__r.City__c) ? o.Customer__r.City__c : 'India',
                formattedDate: o.Order_Date__c ? new Date(o.Order_Date__c).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
                formattedTotal: Number(o.Grand_Total__c || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
                statusBadgeClass: statusBadgeClass,
                step1Class, line1Class, step2Class, line2Class, step3Class, line3Class, step4Class,
                hasShipment: !!shipment,
                courierName: shipment ? (shipment.Courier_Name__c || 'BlueDart Logistics') : '',
                trackingNumber: shipment ? (shipment.Tracking_Number__c || 'BD-7892110') : '',
                expectedDelivery: shipment && shipment.Expected_Delivery_Date__c ? new Date(shipment.Expected_Delivery_Date__c).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'In 2 business days',
                items: items,
                itemCount: items.length,
                isDelivered: isDelivered,
                isEligibleForReturn: isDelivered
            };
        });
    }

    // --- RETURN ACTIONS ---

    handleOpenReturnModal(event) {
        const orderId = event.currentTarget.dataset.id;
        const ord = this.rawOrders.find(o => o.Id === orderId);
        if (ord) {
            this.activeReturnOrder = ord;
            this.returnReason = 'Defective Product';
            this.returnComments = '';
            this.showReturnModal = true;
        }
    }

    handleCloseReturnModal() {
        this.showReturnModal = false;
        this.activeReturnOrder = {};
    }

    handleReturnReasonChange(event) {
        this.returnReason = event.detail.value;
    }

    handleReturnCommentsChange(event) {
        this.returnComments = event.detail.value;
    }

    handleSubmitReturn() {
        this.isSubmittingReturn = true;
        createOrderReturn({
            orderId: this.activeReturnOrder.Id,
            reason: this.returnReason + (this.returnComments ? ` - ${this.returnComments}` : '')
        })
        .then(() => {
            this.handleCloseReturnModal();
            this.refreshOrders();
            this.showBannerToast('Return Request Registered!', 'Reverse pickup assigned. Refund will be credited upon pickup.', 'success', '↩️');
        })
        .catch(err => {
            console.error('Error creating return', err);
            const msg = (err.body && err.body.message) ? err.body.message : 'Return request could not be processed.';
            this.showBannerToast('Return Notice', msg, 'error', '⚠️');
        })
        .finally(() => {
            this.isSubmittingReturn = false;
        });
    }

    // --- CART & CHECKOUT ---

    get cartTotalQty() {
        return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }

    handleAddToCart(event) {
        const product = event.detail.product;
        const qty = event.detail.quantity || 1;
        
        const existing = this.cartItems.find(item => item.productId === product.Id);
        if (existing) {
            existing.quantity += qty;
            existing.lineTotal = (existing.quantity * existing.price).toFixed(2);
            this.cartItems = [...this.cartItems];
        } else {
            const price = product.Final_Price__c || product.Price__c || 0;
            this.cartItems = [...this.cartItems, {
                productId: product.Id,
                name: product.Name,
                price: price,
                quantity: qty,
                lineTotal: (qty * price).toFixed(2)
            }];
        }
        this.showBannerToast('Added to Cart!', `${product.Name} (Qty: ${qty}) added.`, 'success', '🛒');
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
        this.refreshOrders();
        this.currentView = 'orders';
        this.showBannerToast('Order Placed Successfully!', 'Your order is confirmed and shipping is being arranged.', 'success', '🎉');
    }

    // --- TOAST BANNER ---

    showBannerToast(title, message, type = 'success', icon = '✅') {
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }
        this.toast = {
            visible: true,
            title,
            message,
            type,
            icon
        };
        this.toastTimeout = setTimeout(() => {
            this.closeToast();
        }, 4500);
    }

    closeToast() {
        this.toast = { ...this.toast, visible: false };
    }

    get toastContainerClass() {
        return `app-toast toast-${this.toast.type}`;
    }
}

