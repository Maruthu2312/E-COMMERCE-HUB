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

// 1. Initialize Directories
[
    'objects', 'classes', 'triggers', 'lwc', 'permissionsets',
    'profiles', 'layouts', 'flexipages', 'tabs', 'applications',
    'reports', 'dashboards', 'email', 'labels', 'customMetadata', 'flows'
].forEach(sub => ensureDir(path.join(BASE_DIR, sub)));

console.log('Building all Salesforce Metadata in:', BASE_DIR);

// ==========================================
// 1. CUSTOM OBJECT DEFINITIONS & FIELDS
// ==========================================

function createObjectXml(label, pluralLabel, nameFormat, sharingModel = 'ReadWrite') {
    let nameBlock = '';
    if (nameFormat) {
        nameBlock = `
    <nameField>
        <displayFormat>${nameFormat}</displayFormat>
        <label>${label} Number</label>
        <type>AutoNumber</type>
    </nameField>`;
    } else {
        nameBlock = `
    <nameField>
        <label>${label} Name</label>
        <type>Text</type>
    </nameField>`;
    }
    return `<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <actionOverrides>
        <actionName>Accept</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>CancelEdit</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>Clone</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>Delete</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>Edit</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>List</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>New</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>SaveEdit</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>Tab</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>View</actionName>
        <type>Default</type>
    </actionOverrides>
    <allowInChatterGroups>false</allowInChatterGroups>
    <compactLayoutAssignment>SYSTEM</compactLayoutAssignment>
    <deploymentStatus>Deployed</deploymentStatus>
    <enableActivities>true</enableActivities>
    <enableBulkApi>true</enableBulkApi>
    <enableFeeds>false</enableFeeds>
    <enableHistory>true</enableHistory>
    <enableLicensing>false</enableLicensing>
    <enableReports>true</enableReports>
    <enableSearch>true</enableSearch>
    <enableSharing>true</enableSharing>
    <enableStreamingApi>true</enableStreamingApi>
    <label>${label}</label>
    <pluralLabel>${pluralLabel}</pluralLabel>${nameBlock}
    <sharingModel>${sharingModel}</sharingModel>
    <visibility>Public</visibility>
</CustomObject>`;
}

// Field generators
function text(label, length, required = false, unique = false) {
    return `<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${label.replace(/\s+/g, '_')}__c</fullName>
    <externalId>false</externalId>
    <label>${label}</label>
    <length>${length}</length>
    <required>${required}</required>
    <trackHistory>false</trackHistory>
    <type>Text</type>
    <unique>${unique}</unique>
</CustomField>`;
}

function longTextArea(label, length = 32768, visibleLines = 4) {
    return `<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${label.replace(/\s+/g, '_')}__c</fullName>
    <externalId>false</externalId>
    <label>${label}</label>
    <length>${length}</length>
    <type>LongTextArea</type>
    <visibleLines>${visibleLines}</visibleLines>
</CustomField>`;
}

function email(label, required = false, unique = false) {
    return `<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${label.replace(/\s+/g, '_')}__c</fullName>
    <externalId>false</externalId>
    <label>${label}</label>
    <required>${required}</required>
    <trackHistory>false</trackHistory>
    <type>Email</type>
    <unique>${unique}</unique>
</CustomField>`;
}

function phone(label) {
    return `<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${label.replace(/\s+/g, '_')}__c</fullName>
    <externalId>false</externalId>
    <label>${label}</label>
    <type>Phone</type>
</CustomField>`;
}

function dateField(label, required = false) {
    return `<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${label.replace(/\s+/g, '_')}__c</fullName>
    <externalId>false</externalId>
    <label>${label}</label>
    <required>${required}</required>
    <type>Date</type>
</CustomField>`;
}

function dateTimeField(label) {
    return `<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${label.replace(/\s+/g, '_')}__c</fullName>
    <externalId>false</externalId>
    <label>${label}</label>
    <type>DateTime</type>
</CustomField>`;
}

function urlField(label) {
    return `<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${label.replace(/\s+/g, '_')}__c</fullName>
    <externalId>false</externalId>
    <label>${label}</label>
    <type>Url</type>
</CustomField>`;
}

function numberField(label, precision, scale, defaultValue = null) {
    const defBlock = defaultValue !== null ? `<defaultValue>${defaultValue}</defaultValue>` : '';
    return `<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${label.replace(/\s+/g, '_')}__c</fullName>
    ${defBlock}
    <externalId>false</externalId>
    <label>${label}</label>
    <precision>${precision}</precision>
    <scale>${scale}</scale>
    <trackHistory>false</trackHistory>
    <type>Number</type>
    <unique>false</unique>
</CustomField>`;
}

function currencyField(label, precision = 18, scale = 2, defaultValue = null) {
    const defBlock = defaultValue !== null ? `<defaultValue>${defaultValue}</defaultValue>` : '';
    return `<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${label.replace(/\s+/g, '_')}__c</fullName>
    ${defBlock}
    <externalId>false</externalId>
    <label>${label}</label>
    <precision>${precision}</precision>
    <scale>${scale}</scale>
    <trackHistory>false</trackHistory>
    <type>Currency</type>
</CustomField>`;
}

function percentField(label, precision = 5, scale = 2, defaultValue = null) {
    const defBlock = defaultValue !== null ? `<defaultValue>${defaultValue}</defaultValue>` : '';
    return `<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${label.replace(/\s+/g, '_')}__c</fullName>
    ${defBlock}
    <externalId>false</externalId>
    <label>${label}</label>
    <precision>${precision}</precision>
    <scale>${scale}</scale>
    <type>Percent</type>
</CustomField>`;
}

function picklist(label, values, defaultValue = null) {
    const valueSet = values.map(v => `
            <value>
                <fullName>${v}</fullName>
                <default>${v === defaultValue}</default>
                <label>${v}</label>
            </value>`).join('');

    return `<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${label.replace(/\s+/g, '_')}__c</fullName>
    <externalId>false</externalId>
    <label>${label}</label>
    <type>Picklist</type>
    <valueSet>
        <restricted>true</restricted>
        <valueSetDefinition>
            <sorted>false</sorted>${valueSet}
        </valueSetDefinition>
    </valueSet>
</CustomField>`;
}

function lookup(label, refTable, relationshipName, required = false) {
    return `<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${label.replace(/\s+/g, '_')}__c</fullName>
    <deleteConstraint>SetNull</deleteConstraint>
    <externalId>false</externalId>
    <label>${label}</label>
    <referenceTo>${refTable}</referenceTo>
    <relationshipLabel>${relationshipName}</relationshipLabel>
    <relationshipName>${relationshipName.replace(/\s+/g, '_')}</relationshipName>
    <required>${required}</required>
    <type>Lookup</type>
</CustomField>`;
}

function masterDetail(label, refTable, relationshipName) {
    return `<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${label.replace(/\s+/g, '_')}__c</fullName>
    <externalId>false</externalId>
    <label>${label}</label>
    <referenceTo>${refTable}</referenceTo>
    <relationshipLabel>${relationshipName}</relationshipLabel>
    <relationshipName>${relationshipName.replace(/\s+/g, '_')}</relationshipName>
    <relationshipOrder>0</relationshipOrder>
    <reparentableMasterDetail>false</reparentableMasterDetail>
    <trackHistory>false</trackHistory>
    <type>MasterDetail</type>
    <writeRequiresMasterRead>false</writeRequiresMasterRead>
</CustomField>`;
}

function formula(label, formulaType, formulaExpression, precision = 18, scale = 2) {
    let extra = '';
    if (formulaType === 'Currency' || formulaType === 'Number' || formulaType === 'Percent') {
        extra = `
    <precision>${precision}</precision>
    <scale>${scale}</scale>`;
    }
    return `<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${label.replace(/\s+/g, '_')}__c</fullName>
    <externalId>false</externalId>
    <formula>${formulaExpression}</formula>
    <label>${label}</label>${extra}
    <type>${formulaType}</type>
</CustomField>`;
}

function rollUpSummary(label, summaryOp, childObject, summarizedField) {
    let sumFieldBlock = summarizedField ? `<summarizedField>${childObject}.${summarizedField}</summarizedField>` : '';
    let typeBlock = summaryOp === 'count' ? `<precision>18</precision><scale>0</scale><type>Summary</type>` : `<precision>18</precision><scale>2</scale><type>Summary</type>`;
    return `<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${label.replace(/\s+/g, '_')}__c</fullName>
    <externalId>false</externalId>
    <label>${label}</label>${sumFieldBlock}
    <summaryForeignKey>${childObject}.${label.includes('Order') ? 'Order__c' : 'Cart__c'}</summaryForeignKey>
    <summaryOperation>${summaryOp}</summaryOperation>
    ${typeBlock}
</CustomField>`;
}

function validationRule(ruleName, errorConditionFormula, errorMessage, errorDisplayField = null) {
    let fieldBlock = errorDisplayField ? `<errorDisplayField>${errorDisplayField}</errorDisplayField>` : '';
    return `<?xml version="1.0" encoding="UTF-8"?>
<ValidationRule xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${ruleName}</fullName>
    <active>true</active>
    <description>${ruleName}</description>
    <errorConditionFormula>${errorConditionFormula}</errorConditionFormula>
    ${fieldBlock}
    <errorMessage>${errorMessage}</errorMessage>
</ValidationRule>`;
}

// -------------------------------------------------------------
// CREATE ALL 16 CUSTOM OBJECTS & THEIR RESPECTIVE FIELDS
// -------------------------------------------------------------

console.log('Writing Custom Objects & Fields...');

// 1. Customer__c
writeXML('objects/Customer__c/Customer__c.object-meta.xml', createObjectXml('Customer', 'Customers', 'CUST-{00000}'));
writeXML('objects/Customer__c/fields/Customer_Name__c.field-meta.xml', text('Customer Name', 100, true));
writeXML('objects/Customer__c/fields/Email__c.field-meta.xml', email('Email', true, true));
writeXML('objects/Customer__c/fields/Phone__c.field-meta.xml', phone('Phone'));
writeXML('objects/Customer__c/fields/Date_of_Birth__c.field-meta.xml', dateField('Date of Birth'));
writeXML('objects/Customer__c/fields/Gender__c.field-meta.xml', picklist('Gender', ['Male', 'Female', 'Other', 'Prefer Not to Say'], 'Prefer Not to Say'));
writeXML('objects/Customer__c/fields/Street__c.field-meta.xml', text('Street', 255));
writeXML('objects/Customer__c/fields/City__c.field-meta.xml', text('City', 100));
writeXML('objects/Customer__c/fields/State__c.field-meta.xml', text('State', 100));
writeXML('objects/Customer__c/fields/Postal_Code__c.field-meta.xml', text('Postal Code', 20));
writeXML('objects/Customer__c/fields/Country__c.field-meta.xml', text('Country', 100));
writeXML('objects/Customer__c/fields/Customer_Type__c.field-meta.xml', picklist('Customer Type', ['Regular', 'Silver', 'Gold', 'Platinum', 'VIP'], 'Regular'));
writeXML('objects/Customer__c/fields/Customer_Status__c.field-meta.xml', picklist('Customer Status', ['Active', 'Inactive', 'Blocked'], 'Active'));
writeXML('objects/Customer__c/fields/Loyalty_Points__c.field-meta.xml', numberField('Loyalty Points', 18, 0, 0));
writeXML('objects/Customer__c/fields/Total_Orders__c.field-meta.xml', numberField('Total Orders', 18, 0, 0));
writeXML('objects/Customer__c/fields/Total_Spending__c.field-meta.xml', currencyField('Total Spending', 18, 2, 0));
writeXML('objects/Customer__c/fields/Last_Order_Date__c.field-meta.xml', dateField('Last Order Date'));
writeXML('objects/Customer__c/fields/Registration_Date__c.field-meta.xml', dateField('Registration Date'));
writeXML('objects/Customer__c/fields/Customer_Lifetime_Value__c.field-meta.xml', formula('Customer Lifetime Value', 'Currency', 'Total_Spending__c'));
writeXML('objects/Customer__c/fields/Days_Since_Last_Order__c.field-meta.xml', formula('Days Since Last Order', 'Number', 'IF(ISBLANK(Last_Order_Date__c), 0, TODAY() - Last_Order_Date__c)', 18, 0));
writeXML('objects/Customer__c/fields/Customer_Segment__c.field-meta.xml', formula('Customer Segment', 'Text', 'IF(Total_Spending__c >= 100000, "VIP Tier", IF(Total_Spending__c >= 50000, "Platinum Tier", IF(Total_Spending__c >= 25000, "Gold Tier", IF(Total_Spending__c >= 10000, "Silver Tier", "Regular Tier"))))'));

// 2. Category__c
writeXML('objects/Category__c/Category__c.object-meta.xml', createObjectXml('Category', 'Categories', null));
writeXML('objects/Category__c/fields/Category_Code__c.field-meta.xml', text('Category Code', 50, true, true));
writeXML('objects/Category__c/fields/Description__c.field-meta.xml', longTextArea('Description'));
writeXML('objects/Category__c/fields/Category_Status__c.field-meta.xml', picklist('Category Status', ['Active', 'Inactive'], 'Active'));
writeXML('objects/Category__c/fields/Parent_Category__c.field-meta.xml', lookup('Parent Category', 'Category__c', 'Subcategories'));
writeXML('objects/Category__c/fields/Product_Count__c.field-meta.xml', numberField('Product Count', 18, 0, 0));

// 3. Product__c
writeXML('objects/Product__c/Product__c.object-meta.xml', createObjectXml('Product', 'Products', null));
writeXML('objects/Product__c/fields/Product_Code__c.field-meta.xml', text('Product Code', 50, true, true));
writeXML('objects/Product__c/fields/Category__c.field-meta.xml', lookup('Category', 'Category__c', 'Products'));
writeXML('objects/Product__c/fields/Brand__c.field-meta.xml', text('Brand', 100));
writeXML('objects/Product__c/fields/Description__c.field-meta.xml', longTextArea('Description'));
writeXML('objects/Product__c/fields/Product_Image_URL__c.field-meta.xml', urlField('Product Image URL'));
writeXML('objects/Product__c/fields/Price__c.field-meta.xml', currencyField('Price', 18, 2, 0));
writeXML('objects/Product__c/fields/Discount_Percentage__c.field-meta.xml', percentField('Discount Percentage', 5, 2, 0));
writeXML('objects/Product__c/fields/Tax_Percentage__c.field-meta.xml', percentField('Tax Percentage', 5, 2, 18.0));
writeXML('objects/Product__c/fields/Stock_Quantity__c.field-meta.xml', numberField('Stock Quantity', 18, 0, 0));
writeXML('objects/Product__c/fields/Reserved_Quantity__c.field-meta.xml', numberField('Reserved Quantity', 18, 0, 0));
writeXML('objects/Product__c/fields/Reorder_Level__c.field-meta.xml', numberField('Reorder Level', 18, 0, 10));
writeXML('objects/Product__c/fields/Rating__c.field-meta.xml', numberField('Rating', 3, 2, 5.0));
writeXML('objects/Product__c/fields/Product_Status__c.field-meta.xml', picklist('Product Status', ['Active', 'Inactive', 'Out of Stock', 'Discontinued'], 'Active'));
writeXML('objects/Product__c/fields/Final_Price__c.field-meta.xml', formula('Final Price', 'Currency', 'ROUND(Price__c * (1 - (Discount_Percentage__c / 100)), 2)'));
writeXML('objects/Product__c/fields/Available_Quantity__c.field-meta.xml', formula('Available Quantity', 'Number', 'Stock_Quantity__c - Reserved_Quantity__c', 18, 0));
writeXML('objects/Product__c/fields/Stock_Status__c.field-meta.xml', formula('Stock Status', 'Text', 'IF(Available_Quantity__c <= 0, "Out of Stock", IF(Available_Quantity__c <= Reorder_Level__c, "Low Stock", "Available"))'));

// 4. Cart__c
writeXML('objects/Cart__c/Cart__c.object-meta.xml', createObjectXml('Cart', 'Carts', 'CART-{00000}'));
writeXML('objects/Cart__c/fields/Customer__c.field-meta.xml', lookup('Customer', 'Customer__c', 'Carts'));
writeXML('objects/Cart__c/fields/Cart_Status__c.field-meta.xml', picklist('Cart Status', ['Active', 'Abandoned', 'Converted', 'Expired'], 'Active'));
writeXML('objects/Cart__c/fields/Discount__c.field-meta.xml', currencyField('Discount', 18, 2, 0));
writeXML('objects/Cart__c/fields/Tax__c.field-meta.xml', currencyField('Tax', 18, 2, 0));
writeXML('objects/Cart__c/fields/Subtotal__c.field-meta.xml', currencyField('Subtotal', 18, 2, 0));
writeXML('objects/Cart__c/fields/Total_Items__c.field-meta.xml', numberField('Total Items', 18, 0, 0));
writeXML('objects/Cart__c/fields/Grand_Total__c.field-meta.xml', formula('Grand Total', 'Currency', 'Subtotal__c - Discount__c + Tax__c'));

// 5. Cart_Item__c
writeXML('objects/Cart_Item__c/Cart_Item__c.object-meta.xml', createObjectXml('Cart Item', 'Cart Items', 'CI-{00000}', 'ControlledByParent'));
writeXML('objects/Cart_Item__c/fields/Cart__c.field-meta.xml', masterDetail('Cart', 'Cart__c', 'Cart Items'));
writeXML('objects/Cart_Item__c/fields/Product__c.field-meta.xml', lookup('Product', 'Product__c', 'Cart Items'));
writeXML('objects/Cart_Item__c/fields/Quantity__c.field-meta.xml', numberField('Quantity', 18, 0, 1));
writeXML('objects/Cart_Item__c/fields/Unit_Price__c.field-meta.xml', currencyField('Unit Price', 18, 2, 0));
writeXML('objects/Cart_Item__c/fields/Discount__c.field-meta.xml', currencyField('Discount', 18, 2, 0));
writeXML('objects/Cart_Item__c/fields/Tax__c.field-meta.xml', currencyField('Tax', 18, 2, 0));
writeXML('objects/Cart_Item__c/fields/Total_Price__c.field-meta.xml', formula('Total Price', 'Currency', '(Quantity__c * Unit_Price__c) - Discount__c + Tax__c'));

// 6. Order__c
writeXML('objects/Order__c/Order__c.object-meta.xml', createObjectXml('Order', 'Orders', 'ORD-{00000}'));
writeXML('objects/Order__c/fields/Customer__c.field-meta.xml', lookup('Customer', 'Customer__c', 'Orders'));
writeXML('objects/Order__c/fields/Order_Date__c.field-meta.xml', dateTimeField('Order Date'));
writeXML('objects/Order__c/fields/Order_Status__c.field-meta.xml', picklist('Order Status', [
    'Draft', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Completed'
], 'Draft'));
writeXML('objects/Order__c/fields/Payment_Status__c.field-meta.xml', picklist('Payment Status', ['Pending', 'Partially Paid', 'Paid', 'Failed', 'Refunded'], 'Pending'));
writeXML('objects/Order__c/fields/Shipping_Status__c.field-meta.xml', picklist('Shipping Status', ['Not Shipped', 'Preparing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Delayed'], 'Not Shipped'));
writeXML('objects/Order__c/fields/Subtotal__c.field-meta.xml', currencyField('Subtotal', 18, 2, 0));
writeXML('objects/Order__c/fields/Discount__c.field-meta.xml', currencyField('Discount', 18, 2, 0));
writeXML('objects/Order__c/fields/Tax__c.field-meta.xml', currencyField('Tax', 18, 2, 0));
writeXML('objects/Order__c/fields/Shipping_Charge__c.field-meta.xml', currencyField('Shipping Charge', 18, 2, 0));
writeXML('objects/Order__c/fields/Grand_Total__c.field-meta.xml', formula('Grand Total', 'Currency', 'Subtotal__c - Discount__c + Tax__c + Shipping_Charge__c'));
writeXML('objects/Order__c/fields/Billing_Address__c.field-meta.xml', text('Billing Address', 255));
writeXML('objects/Order__c/fields/Shipping_Address__c.field-meta.xml', text('Shipping Address', 255));
writeXML('objects/Order__c/fields/Expected_Delivery_Date__c.field-meta.xml', dateField('Expected Delivery Date'));
writeXML('objects/Order__c/fields/Actual_Delivery_Date__c.field-meta.xml', dateField('Actual Delivery Date'));
writeXML('objects/Order__c/fields/Cancellation_Reason__c.field-meta.xml', text('Cancellation Reason', 255));
writeXML('objects/Order__c/fields/Return_Eligibility__c.field-meta.xml', formula('Return Eligibility', 'Checkbox', 'ISPICKVAL(Order_Status__c, "Delivered") && NOT(ISBLANK(Actual_Delivery_Date__c)) && (TODAY() - Actual_Delivery_Date__c <= 15)'));

// 7. Order_Item__c
writeXML('objects/Order_Item__c/Order_Item__c.object-meta.xml', createObjectXml('Order Item', 'Order Items', 'OI-{00000}', 'ControlledByParent'));
writeXML('objects/Order_Item__c/fields/Order__c.field-meta.xml', masterDetail('Order', 'Order__c', 'Order Items'));
writeXML('objects/Order_Item__c/fields/Product__c.field-meta.xml', lookup('Product', 'Product__c', 'Order Items'));
writeXML('objects/Order_Item__c/fields/Quantity__c.field-meta.xml', numberField('Quantity', 18, 0, 1));
writeXML('objects/Order_Item__c/fields/Unit_Price__c.field-meta.xml', currencyField('Unit Price', 18, 2, 0));
writeXML('objects/Order_Item__c/fields/Discount__c.field-meta.xml', currencyField('Discount', 18, 2, 0));
writeXML('objects/Order_Item__c/fields/Tax__c.field-meta.xml', currencyField('Tax', 18, 2, 0));
writeXML('objects/Order_Item__c/fields/Total_Price__c.field-meta.xml', formula('Total Price', 'Currency', '(Quantity__c * Unit_Price__c) - Discount__c + Tax__c'));

// 8. Payment__c
writeXML('objects/Payment__c/Payment__c.object-meta.xml', createObjectXml('Payment', 'Payments', 'PAY-{00000}'));
writeXML('objects/Payment__c/fields/Order__c.field-meta.xml', lookup('Order', 'Order__c', 'Payments'));
writeXML('objects/Payment__c/fields/Customer__c.field-meta.xml', lookup('Customer', 'Customer__c', 'Payments'));
writeXML('objects/Payment__c/fields/Amount__c.field-meta.xml', currencyField('Amount', 18, 2, 0));
writeXML('objects/Payment__c/fields/Payment_Method__c.field-meta.xml', picklist('Payment Method', ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet', 'Cash on Delivery'], 'UPI'));
writeXML('objects/Payment__c/fields/Payment_Status__c.field-meta.xml', picklist('Payment Status', ['Pending', 'Processing', 'Successful', 'Failed', 'Refunded'], 'Pending'));
writeXML('objects/Payment__c/fields/Transaction_ID__c.field-meta.xml', text('Transaction ID', 100));
writeXML('objects/Payment__c/fields/Payment_Date__c.field-meta.xml', dateTimeField('Payment Date'));
writeXML('objects/Payment__c/fields/Failure_Reason__c.field-meta.xml', text('Failure Reason', 255));

// 9. Shipment__c
writeXML('objects/Shipment__c/Shipment__c.object-meta.xml', createObjectXml('Shipment', 'Shipments', 'SHIP-{00000}'));
writeXML('objects/Shipment__c/fields/Order__c.field-meta.xml', lookup('Order', 'Order__c', 'Shipments'));
writeXML('objects/Shipment__c/fields/Customer__c.field-meta.xml', lookup('Customer', 'Customer__c', 'Shipments'));
writeXML('objects/Shipment__c/fields/Courier_Name__c.field-meta.xml', text('Courier Name', 100));
writeXML('objects/Shipment__c/fields/Tracking_Number__c.field-meta.xml', text('Tracking Number', 100));
writeXML('objects/Shipment__c/fields/Shipping_Address__c.field-meta.xml', text('Shipping Address', 255));
writeXML('objects/Shipment__c/fields/Shipment_Date__c.field-meta.xml', dateField('Shipment Date'));
writeXML('objects/Shipment__c/fields/Expected_Delivery_Date__c.field-meta.xml', dateField('Expected Delivery Date'));
writeXML('objects/Shipment__c/fields/Actual_Delivery_Date__c.field-meta.xml', dateField('Actual Delivery Date'));
writeXML('objects/Shipment__c/fields/Shipment_Status__c.field-meta.xml', picklist('Shipment Status', ['Preparing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Delayed', 'Lost'], 'Preparing'));

// 10. Return__c
writeXML('objects/Return__c/Return__c.object-meta.xml', createObjectXml('Return', 'Returns', 'RET-{00000}'));
writeXML('objects/Return__c/fields/Order__c.field-meta.xml', lookup('Order', 'Order__c', 'Returns'));
writeXML('objects/Return__c/fields/Order_Item__c.field-meta.xml', lookup('Order Item', 'Order_Item__c', 'Returns'));
writeXML('objects/Return__c/fields/Customer__c.field-meta.xml', lookup('Customer', 'Customer__c', 'Returns'));
writeXML('objects/Return__c/fields/Return_Reason__c.field-meta.xml', picklist('Return Reason', [
    'Defective Product', 'Wrong Item Delivered', 'Damaged in Transit', 'Product Not as Described', 'Size or Fit Issue', 'Changed Mind'
], 'Defective Product'));
writeXML('objects/Return__c/fields/Return_Description__c.field-meta.xml', longTextArea('Return Description'));
writeXML('objects/Return__c/fields/Return_Date__c.field-meta.xml', dateField('Return Date'));
writeXML('objects/Return__c/fields/Return_Status__c.field-meta.xml', picklist('Return Status', [
    'Requested', 'Approved', 'Rejected', 'Pickup Scheduled', 'Received', 'Refund Initiated', 'Completed'
], 'Requested'));
writeXML('objects/Return__c/fields/Refund_Amount__c.field-meta.xml', currencyField('Refund Amount', 18, 2, 0));
writeXML('objects/Return__c/fields/Pickup_Date__c.field-meta.xml', dateField('Pickup Date'));
writeXML('objects/Return__c/fields/Received_Date__c.field-meta.xml', dateField('Received Date'));

// 11. Refund__c
writeXML('objects/Refund__c/Refund__c.object-meta.xml', createObjectXml('Refund', 'Refunds', 'REF-{00000}'));
writeXML('objects/Refund__c/fields/Return__c.field-meta.xml', lookup('Return', 'Return__c', 'Refunds'));
writeXML('objects/Refund__c/fields/Order__c.field-meta.xml', lookup('Order', 'Order__c', 'Refunds'));
writeXML('objects/Refund__c/fields/Customer__c.field-meta.xml', lookup('Customer', 'Customer__c', 'Refunds'));
writeXML('objects/Refund__c/fields/Refund_Amount__c.field-meta.xml', currencyField('Refund Amount', 18, 2, 0));
writeXML('objects/Refund__c/fields/Refund_Method__c.field-meta.xml', picklist('Refund Method', ['Original Payment Method', 'Store Credit', 'UPI', 'Bank Transfer'], 'Original Payment Method'));
writeXML('objects/Refund__c/fields/Refund_Status__c.field-meta.xml', picklist('Refund Status', ['Pending', 'Processing', 'Completed', 'Failed'], 'Pending'));
writeXML('objects/Refund__c/fields/Refund_Date__c.field-meta.xml', dateTimeField('Refund Date'));
writeXML('objects/Refund__c/fields/Transaction_ID__c.field-meta.xml', text('Transaction ID', 100));

// 12. Review__c
writeXML('objects/Review__c/Review__c.object-meta.xml', createObjectXml('Review', 'Reviews', 'REV-{00000}'));
writeXML('objects/Review__c/fields/Customer__c.field-meta.xml', lookup('Customer', 'Customer__c', 'Reviews'));
writeXML('objects/Review__c/fields/Product__c.field-meta.xml', lookup('Product', 'Product__c', 'Reviews'));
writeXML('objects/Review__c/fields/Order__c.field-meta.xml', lookup('Order', 'Order__c', 'Reviews'));
writeXML('objects/Review__c/fields/Rating__c.field-meta.xml', numberField('Rating', 1, 0, 5));
writeXML('objects/Review__c/fields/Review_Title__c.field-meta.xml', text('Review Title', 150));
writeXML('objects/Review__c/fields/Review_Description__c.field-meta.xml', longTextArea('Review Description'));
writeXML('objects/Review__c/fields/Review_Status__c.field-meta.xml', picklist('Review Status', ['Pending', 'Approved', 'Rejected'], 'Approved'));
writeXML('objects/Review__c/fields/Review_Date__c.field-meta.xml', dateField('Review Date'));

// 13. Wishlist__c
writeXML('objects/Wishlist__c/Wishlist__c.object-meta.xml', createObjectXml('Wishlist', 'Wishlists', 'WISH-{00000}'));
writeXML('objects/Wishlist__c/fields/Customer__c.field-meta.xml', lookup('Customer', 'Customer__c', 'Wishlists'));
writeXML('objects/Wishlist__c/fields/Product__c.field-meta.xml', lookup('Product', 'Product__c', 'Wishlists'));
writeXML('objects/Wishlist__c/fields/Added_Date__c.field-meta.xml', dateField('Added Date'));
writeXML('objects/Wishlist__c/fields/Wishlist_Status__c.field-meta.xml', picklist('Wishlist Status', ['Active', 'Purchased', 'Removed'], 'Active'));

// 14. Coupon__c
writeXML('objects/Coupon__c/Coupon__c.object-meta.xml', createObjectXml('Coupon', 'Coupons', null));
writeXML('objects/Coupon__c/fields/Coupon_Code__c.field-meta.xml', text('Coupon Code', 50, true, true));
writeXML('objects/Coupon__c/fields/Coupon_Name__c.field-meta.xml', text('Coupon Name', 100));
writeXML('objects/Coupon__c/fields/Discount_Type__c.field-meta.xml', picklist('Discount Type', ['Percentage', 'Fixed Amount'], 'Percentage'));
writeXML('objects/Coupon__c/fields/Discount_Value__c.field-meta.xml', numberField('Discount Value', 18, 2, 10));
writeXML('objects/Coupon__c/fields/Minimum_Order_Amount__c.field-meta.xml', currencyField('Minimum Order Amount', 18, 2, 500));
writeXML('objects/Coupon__c/fields/Maximum_Discount__c.field-meta.xml', currencyField('Maximum Discount', 18, 2, 2000));
writeXML('objects/Coupon__c/fields/Start_Date__c.field-meta.xml', dateField('Start Date'));
writeXML('objects/Coupon__c/fields/End_Date__c.field-meta.xml', dateField('End Date'));
writeXML('objects/Coupon__c/fields/Usage_Limit__c.field-meta.xml', numberField('Usage Limit', 18, 0, 1000));
writeXML('objects/Coupon__c/fields/Used_Count__c.field-meta.xml', numberField('Used Count', 18, 0, 0));
writeXML('objects/Coupon__c/fields/Coupon_Status__c.field-meta.xml', picklist('Coupon Status', ['Active', 'Inactive', 'Expired'], 'Active'));

// 15. Inventory_Transaction__c
writeXML('objects/Inventory_Transaction__c/Inventory_Transaction__c.object-meta.xml', createObjectXml('Inventory Transaction', 'Inventory Transactions', 'INV-{00000}'));
writeXML('objects/Inventory_Transaction__c/fields/Product__c.field-meta.xml', lookup('Product', 'Product__c', 'Inventory Transactions'));
writeXML('objects/Inventory_Transaction__c/fields/Transaction_Type__c.field-meta.xml', picklist('Transaction Type', [
    'Purchase', 'Sale', 'Return', 'Adjustment', 'Reservation', 'Release'
], 'Sale'));
writeXML('objects/Inventory_Transaction__c/fields/Quantity__c.field-meta.xml', numberField('Quantity', 18, 0, 1));
writeXML('objects/Inventory_Transaction__c/fields/Reference_Order__c.field-meta.xml', lookup('Reference Order', 'Order__c', 'Inventory Transactions'));
writeXML('objects/Inventory_Transaction__c/fields/Transaction_Date__c.field-meta.xml', dateTimeField('Transaction Date'));
writeXML('objects/Inventory_Transaction__c/fields/Previous_Stock__c.field-meta.xml', numberField('Previous Stock', 18, 0, 0));
writeXML('objects/Inventory_Transaction__c/fields/New_Stock__c.field-meta.xml', numberField('New Stock', 18, 0, 0));
writeXML('objects/Inventory_Transaction__c/fields/Reason__c.field-meta.xml', text('Reason', 255));

// 16. Loyalty_Transaction__c
writeXML('objects/Loyalty_Transaction__c/Loyalty_Transaction__c.object-meta.xml', createObjectXml('Loyalty Transaction', 'Loyalty Transactions', 'LOY-{00000}'));
writeXML('objects/Loyalty_Transaction__c/fields/Customer__c.field-meta.xml', lookup('Customer', 'Customer__c', 'Loyalty Transactions'));
writeXML('objects/Loyalty_Transaction__c/fields/Order__c.field-meta.xml', lookup('Order', 'Order__c', 'Loyalty Transactions'));
writeXML('objects/Loyalty_Transaction__c/fields/Points_Earned__c.field-meta.xml', numberField('Points Earned', 18, 0, 0));
writeXML('objects/Loyalty_Transaction__c/fields/Points_Redeemed__c.field-meta.xml', numberField('Points Redeemed', 18, 0, 0));
writeXML('objects/Loyalty_Transaction__c/fields/Transaction_Type__c.field-meta.xml', picklist('Transaction Type', ['Earned', 'Redeemed', 'Expired', 'Adjusted'], 'Earned'));
writeXML('objects/Loyalty_Transaction__c/fields/Transaction_Date__c.field-meta.xml', dateTimeField('Transaction Date'));
writeXML('objects/Loyalty_Transaction__c/fields/Description__c.field-meta.xml', text('Description', 255));

// -------------------------------------------------------------
// 15+ VALIDATION RULES
// -------------------------------------------------------------
console.log('Writing Validation Rules...');

// 1. Product price must be greater than zero
writeXML('objects/Product__c/validationRules/VR_Product_Price_Greater_Than_Zero.validationRule-meta.xml', 
    validationRule('VR_Product_Price_Greater_Than_Zero', 'Price__c &lt;= 0', 'Product price must be strictly greater than zero.', 'Price__c'));

// 2. Discount must be between 0 and 100
writeXML('objects/Product__c/validationRules/VR_Discount_Between_0_And_100.validationRule-meta.xml', 
    validationRule('VR_Discount_Between_0_And_100', 'Discount_Percentage__c &lt; 0 || Discount_Percentage__c &gt; 100', 'Discount percentage must be between 0 and 100.', 'Discount_Percentage__c'));

// 3. Stock cannot be negative
writeXML('objects/Product__c/validationRules/VR_Stock_Cannot_Be_Negative.validationRule-meta.xml', 
    validationRule('VR_Stock_Cannot_Be_Negative', 'Stock_Quantity__c &lt; 0', 'Stock Quantity cannot be negative.', 'Stock_Quantity__c'));

// 4. Order Item quantity must be greater than zero
writeXML('objects/Order_Item__c/validationRules/VR_Order_Quantity_Greater_Than_Zero.validationRule-meta.xml', 
    validationRule('VR_Order_Quantity_Greater_Than_Zero', 'Quantity__c &lt;= 0', 'Order item quantity must be greater than zero.', 'Quantity__c'));

// 5. Payment amount must be greater than zero
writeXML('objects/Payment__c/validationRules/VR_Payment_Amount_Greater_Than_Zero.validationRule-meta.xml', 
    validationRule('VR_Payment_Amount_Greater_Than_Zero', 'Amount__c &lt;= 0', 'Payment amount must be greater than zero.', 'Amount__c'));

// 6. Return cannot be requested without an order
writeXML('objects/Return__c/validationRules/VR_Return_Requires_Order.validationRule-meta.xml', 
    validationRule('VR_Return_Requires_Order', 'ISBLANK(Order__c)', 'A return cannot be requested without specifying an associated Order.', 'Order__c'));

// 7. Review rating must be between 1 and 5
writeXML('objects/Review__c/validationRules/VR_Rating_Between_1_And_5.validationRule-meta.xml', 
    validationRule('VR_Rating_Between_1_And_5', 'Rating__c &lt; 1 || Rating__c &gt; 5', 'Review rating must be an integer between 1 and 5 stars.', 'Rating__c'));

// 8. Coupon discount cannot be negative
writeXML('objects/Coupon__c/validationRules/VR_Coupon_Discount_Non_Negative.validationRule-meta.xml', 
    validationRule('VR_Coupon_Discount_Non_Negative', 'Discount_Value__c &lt;= 0', 'Coupon discount value must be greater than zero.', 'Discount_Value__c'));

// 9. Coupon end date cannot be before start date
writeXML('objects/Coupon__c/validationRules/VR_Coupon_End_After_Start.validationRule-meta.xml', 
    validationRule('VR_Coupon_End_After_Start', 'NOT(ISBLANK(Start_Date__c)) &amp;&amp; NOT(ISBLANK(End_Date__c)) &amp;&amp; End_Date__c &lt; Start_Date__c', 'Coupon validity end date cannot be prior to start date.', 'End_Date__c'));

// 10. Delivery date cannot be before shipment date
writeXML('objects/Shipment__c/validationRules/VR_Delivery_After_Shipment.validationRule-meta.xml', 
    validationRule('VR_Delivery_After_Shipment', 'NOT(ISBLANK(Actual_Delivery_Date__c)) &amp;&amp; NOT(ISBLANK(Shipment_Date__c)) &amp;&amp; Actual_Delivery_Date__c &lt; Shipment_Date__c', 'Actual Delivery date cannot be earlier than Shipment date.', 'Actual_Delivery_Date__c'));

// 11. Refund amount cannot exceed eligible amount
writeXML('objects/Refund__c/validationRules/VR_Refund_Amount_Positive.validationRule-meta.xml', 
    validationRule('VR_Refund_Amount_Positive', 'Refund_Amount__c &lt;= 0', 'Refund amount must be strictly greater than zero.', 'Refund_Amount__c'));

// 12. Required customer email must be valid
writeXML('objects/Customer__c/validationRules/VR_Valid_Customer_Email.validationRule-meta.xml', 
    validationRule('VR_Valid_Customer_Email', 'NOT(REGEX(Email__c, "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"))', 'Please provide a valid email address (e.g. user@domain.com).', 'Email__c'));

// 13. Prevent invalid order status transitions
writeXML('objects/Order__c/validationRules/VR_Prevent_Draft_To_Completed.validationRule-meta.xml', 
    validationRule('VR_Prevent_Draft_To_Completed', 'ISCHANGED(Order_Status__c) &amp;&amp; ISPICKVAL(PRIORVALUE(Order_Status__c), "Draft") &amp;&amp; (ISPICKVAL(Order_Status__c, "Delivered") || ISPICKVAL(Order_Status__c, "Completed"))', 'An order in Draft status must first be Confirmed, Processed, and Shipped before completion.'));

// 14. Prevent payment status from becoming Paid when amount is invalid
writeXML('objects/Payment__c/validationRules/VR_Paid_Requires_Valid_Amount.validationRule-meta.xml', 
    validationRule('VR_Paid_Requires_Valid_Amount', 'ISPICKVAL(Payment_Status__c, "Successful") &amp;&amp; (ISBLANK(Amount__c) || Amount__c &lt;= 0)', 'Payment cannot be marked as Successful with a zero or negative amount.', 'Amount__c'));

// 15. Prevent ordering unavailable products
writeXML('objects/Order_Item__c/validationRules/VR_Prevent_Zero_Unit_Price.validationRule-meta.xml', 
    validationRule('VR_Prevent_Zero_Unit_Price', 'Unit_Price__c &lt;= 0', 'Order item unit price must be greater than zero.', 'Unit_Price__c'));

// 16. Cart item quantity must be positive
writeXML('objects/Cart_Item__c/validationRules/VR_Cart_Quantity_Positive.validationRule-meta.xml', 
    validationRule('VR_Cart_Quantity_Positive', 'Quantity__c &lt;= 0', 'Quantity must be at least 1.', 'Quantity__c'));

console.log('Objects, Fields & Validation Rules Generated Successfully!');
