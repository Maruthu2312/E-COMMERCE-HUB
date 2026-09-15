import { LightningElement, track, wire } from 'lwc';
import getAdminKpis from '@salesforce/apex/ECommerceController.getAdminKpis';
import getLowStockProducts from '@salesforce/apex/ECommerceController.getLowStockProducts';
import restockProduct from '@salesforce/apex/ECommerceController.restockProduct';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AdminDashboard extends LightningElement {
    @track kpis = {
        totalRevenue: '0.00',
        totalOrders: 0,
        totalCustomers: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        lowStockProducts: 0,
        returnRequests: 0,
        vipCustomers: 0
    };

    @track lowStockRaw = [];
    @track isRestocking = false;

    wiredKpisResult;
    wiredLowStockResult;

    @wire(getAdminKpis)
    wiredKpis(result) {
        this.wiredKpisResult = result;
        const { error, data } = result;
        if (data) {
            this.kpis = {
                ...data,
                totalRevenue: Number(data.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })
            };
        } else if (error) {
            console.error('Error fetching admin KPIs', error);
        }
    }

    @wire(getLowStockProducts)
    wiredLowStock(result) {
        this.wiredLowStockResult = result;
        const { error, data } = result;
        if (data) {
            this.lowStockRaw = data;
        } else if (error) {
            console.error('Error fetching low stock products', error);
        }
    }

    get hasLowStockProducts() {
        return this.lowStockRaw && this.lowStockRaw.length > 0;
    }

    get lowStockList() {
        return this.lowStockRaw.map(item => {
            const avail = item.Available_Quantity__c || 0;
            const isCritical = avail <= 5;
            return {
                ...item,
                categoryName: (item.Category__r && item.Category__r.Name) ? item.Category__r.Name : 'General',
                formattedPrice: Number(item.Final_Price__c || item.Price__c || 0).toLocaleString('en-IN'),
                stockNumberClass: isCritical ? 'stock-num critical' : 'stock-num warning',
                healthBadgeClass: isCritical ? 'badge-pill badge-critical' : 'badge-pill badge-warning'
            };
        });
    }

    handleRestockClick(event) {
        const productId = event.currentTarget.dataset.id;
        const productName = event.currentTarget.dataset.name;
        this.isRestocking = true;

        restockProduct({ productId: productId, quantityToAdd: 25 })
            .then(() => {
                this.showToast('Inventory Replenished!', `Successfully added +25 units to ${productName}. Stock updated & logged.`, 'success');
                return Promise.all([
                    refreshApex(this.wiredKpisResult),
                    refreshApex(this.wiredLowStockResult)
                ]);
            })
            .catch(error => {
                console.error('Restock failed', error);
                this.showToast('Restock Error', (error.body && error.body.message) || 'Failed to replenish stock.', 'error');
            })
            .finally(() => {
                this.isRestocking = false;
            });
    }

    handleRefreshAll() {
        this.isRestocking = true;
        Promise.all([
            refreshApex(this.wiredKpisResult),
            refreshApex(this.wiredLowStockResult)
        ])
        .then(() => {
            this.showToast('Data Synced', 'Live operational KPIs and inventory synchronized with Salesforce.', 'info');
        })
        .finally(() => {
            this.isRestocking = false;
        });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }
}

