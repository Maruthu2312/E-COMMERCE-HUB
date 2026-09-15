import { LightningElement, wire, track } from 'lwc';
import getCategories from '@salesforce/apex/ECommerceController.getCategories';

export default class ProductSearch extends LightningElement {
    @track searchTerm = '';
    @track selectedCategory = '';
    @track sortBy = 'featured';
    @track inStockOnly = false;
    @track rawCategories = [];

    @wire(getCategories)
    wiredCategories({ error, data }) {
        if (data) {
            this.rawCategories = data;
        }
    }

    get hasSearchTerm() {
        return this.searchTerm && this.searchTerm.trim().length > 0;
    }

    get categoryPills() {
        const pills = [
            {
                id: '',
                name: 'All Departments',
                emoji: '✨',
                cssClass: this.selectedCategory === '' ? 'pill active' : 'pill'
            }
        ];

        this.rawCategories.forEach(cat => {
            const name = cat.Name || '';
            let emoji = '🛍️';
            const lower = name.toLowerCase();
            if (lower.includes('mobile') || lower.includes('phone')) emoji = '📱';
            else if (lower.includes('laptop') || lower.includes('computer')) emoji = '💻';
            else if (lower.includes('audio') || lower.includes('wearable')) emoji = '🎧';
            else if (lower.includes('appliance') || lower.includes('smart home')) emoji = '🏠';
            else if (lower.includes('fashion') || lower.includes('casual')) emoji = '👕';
            else if (lower.includes('kitchen') || lower.includes('home & kitchen')) emoji = '🍳';
            else if (lower.includes('fitness') || lower.includes('sports')) emoji = '🏋️';
            else if (lower.includes('book') || lower.includes('learning')) emoji = '📚';

            pills.push({
                id: cat.Id,
                name: name,
                emoji: emoji,
                cssClass: this.selectedCategory === cat.Id ? 'pill active' : 'pill'
            });
        });

        return pills;
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.dispatchFilterEvent();
    }

    handleClearSearch() {
        this.searchTerm = '';
        this.dispatchFilterEvent();
    }

    handlePillClick(event) {
        this.selectedCategory = event.currentTarget.dataset.id;
        this.dispatchFilterEvent();
    }

    handleSortChange(event) {
        this.sortBy = event.target.value;
        this.dispatchFilterEvent();
    }

    handleInStockToggle(event) {
        this.inStockOnly = event.target.checked;
        this.dispatchFilterEvent();
    }

    handleReset() {
        this.searchTerm = '';
        this.selectedCategory = '';
        this.sortBy = 'featured';
        this.inStockOnly = false;
        this.dispatchFilterEvent();
    }

    dispatchFilterEvent() {
        this.dispatchEvent(new CustomEvent('filterchange', {
            detail: {
                searchTerm: this.searchTerm,
                categoryId: this.selectedCategory,
                sortBy: this.sortBy,
                inStockOnly: this.inStockOnly
            }
        }));
    }
}
