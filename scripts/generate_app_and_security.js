const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const BASE_DIR = path.join(ROOT_DIR, 'force-app', 'main', 'default');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function writeXML(relPath, content) {
    const fullPath = path.join(BASE_DIR, relPath);
    ensureDir(path.dirname(fullPath));
    fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
}

console.log('Generating Tabs, Lightning App, and Permission Sets...');

// 1. LWC Tab
writeXML('tabs/ECommerce_Hub.tab-meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<CustomTab xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>E-Commerce Hub</label>
    <motif>Custom67: Real Estate Sign</motif>
    <lwcComponent>ecommerceDashboard</lwcComponent>
</CustomTab>`);

// Custom Object Tabs
const customObjects = [
    { obj: 'Customer__c', label: 'Customers', icon: 'Custom15: People' },
    { obj: 'Category__c', label: 'Categories', icon: 'Custom38: Camera' },
    { obj: 'Product__c', label: 'Products', icon: 'Custom40: Compass' },
    { obj: 'Order__c', label: 'Orders', icon: 'Custom93: Shopping Cart' },
    { obj: 'Payment__c', label: 'Payments', icon: 'Custom41: Cash' },
    { obj: 'Shipment__c', label: 'Shipments', icon: 'Custom98: Truck' },
    { obj: 'Return__c', label: 'Returns', icon: 'Custom51: Books' },
    { obj: 'Refund__c', label: 'Refunds', icon: 'Custom17: Sack' },
    { obj: 'Review__c', label: 'Reviews', icon: 'Custom83: Pencil' },
    { obj: 'Wishlist__c', label: 'Wishlists', icon: 'Custom53: Bell' },
    { obj: 'Coupon__c', label: 'Coupons', icon: 'Custom28: Key' },
    { obj: 'Inventory_Transaction__c', label: 'Inventory Audit', icon: 'Custom64: Compass' },
    { obj: 'Loyalty_Transaction__c', label: 'Loyalty Ledger', icon: 'Custom70: Diamond' }
];

customObjects.forEach(({ obj, label, icon }) => {
    writeXML(`tabs/${obj}.tab-meta.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<CustomTab xmlns="http://soap.sforce.com/2006/04/metadata">
    <customObject>true</customObject>
    <motif>${icon}</motif>
</CustomTab>`);
});

// 2. Custom Application (Lightning App)
writeXML('applications/ECommerce_CRM.app-meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<CustomApplication xmlns="http://soap.sforce.com/2006/04/metadata">
    <brand>
        <headerColor>#0070D2</headerColor>
        <shouldOverrideOrgTheme>false</shouldOverrideOrgTheme>
    </brand>
    <description>Advanced E-Commerce Customer Management and Sales Automation CRM</description>
    <formFactors>Large</formFactors>
    <isNavAutoUpdateVerified>false</isNavAutoUpdateVerified>
    <isNavPersonalizationDisabled>false</isNavPersonalizationDisabled>
    <isNavTabPersistenceDisabled>false</isNavTabPersistenceDisabled>
    <label>E-Commerce CRM</label>
    <navType>Standard</navType>
    <tabs>ECommerce_Hub</tabs>
    <tabs>Customer__c</tabs>
    <tabs>Order__c</tabs>
    <tabs>Product__c</tabs>
    <tabs>Category__c</tabs>
    <tabs>Payment__c</tabs>
    <tabs>Shipment__c</tabs>
    <tabs>Return__c</tabs>
    <tabs>Refund__c</tabs>
    <tabs>Coupon__c</tabs>
    <tabs>Inventory_Transaction__c</tabs>
    <tabs>Loyalty_Transaction__c</tabs>
    <tabs>standard-Case</tabs>
    <tabs>standard-report</tabs>
    <tabs>standard-Dashboard</tabs>
    <uiType>Lightning</uiType>
    <utilityBar>ECommerce_CRM_UtilityBar</utilityBar>
</CustomApplication>`);

// 3. Permission Sets
function createPermSet(name, label, desc, objectPerms) {
    let objBlock = objectPerms.map(op => `
    <objectPermissions>
        <allowCreate>${op.create}</allowCreate>
        <allowDelete>${op.delete}</allowDelete>
        <allowEdit>${op.edit}</allowEdit>
        <allowRead>${op.read}</allowRead>
        <modifyAllRecords>${op.modifyAll}</modifyAllRecords>
        <object>${op.object}</object>
        <viewAllRecords>${op.viewAll}</viewAllRecords>
    </objectPermissions>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">
    <description>${desc}</description>
    <hasActivationRequired>false</hasActivationRequired>
    <label>${label}</label>${objBlock}
</PermissionSet>`;
}

writeXML('permissionsets/Order_Management_Permissions.permissionset-meta.xml',
    createPermSet('Order_Management_Permissions', 'Order Management Access', 'Access to Orders, Order Items, Shipments and Customers', [
        { object: 'Customer__c', read: true, create: true, edit: true, delete: false, viewAll: true, modifyAll: false },
        { object: 'Order__c', read: true, create: true, edit: true, delete: false, viewAll: true, modifyAll: false },
        { object: 'Shipment__c', read: true, create: true, edit: true, delete: false, viewAll: true, modifyAll: false }
    ])
);

writeXML('permissionsets/Inventory_Management_Permissions.permissionset-meta.xml',
    createPermSet('Inventory_Management_Permissions', 'Inventory Management Access', 'Full access to Products, Categories and Inventory Audit Records', [
        { object: 'Product__c', read: true, create: true, edit: true, delete: true, viewAll: true, modifyAll: true },
        { object: 'Category__c', read: true, create: true, edit: true, delete: true, viewAll: true, modifyAll: true },
        { object: 'Inventory_Transaction__c', read: true, create: true, edit: false, delete: false, viewAll: true, modifyAll: false }
    ])
);

writeXML('permissionsets/Payment_Management_Permissions.permissionset-meta.xml',
    createPermSet('Payment_Management_Permissions', 'Payment & Finance Access', 'Access to Payments and Refunds records', [
        { object: 'Payment__c', read: true, create: true, edit: true, delete: false, viewAll: true, modifyAll: false },
        { object: 'Refund__c', read: true, create: true, edit: true, delete: false, viewAll: true, modifyAll: false }
    ])
);

writeXML('permissionsets/Customer_Support_Permissions.permissionset-meta.xml',
    createPermSet('Customer_Support_Permissions', 'Customer Support Access', 'Access to Returns, Reviews and Customer Profiles', [
        { object: 'Return__c', read: true, create: true, edit: true, delete: false, viewAll: true, modifyAll: false },
        { object: 'Review__c', read: true, create: true, edit: true, delete: false, viewAll: true, modifyAll: false },
        { object: 'Customer__c', read: true, create: false, edit: true, delete: false, viewAll: true, modifyAll: false }
    ])
);

console.log('Tabs, Application and Security Permission Sets generated!');
