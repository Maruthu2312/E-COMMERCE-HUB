const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const BASE_DIR = path.join(ROOT_DIR, 'force-app', 'main', 'default');
const OBJECTS_DIR = path.join(BASE_DIR, 'objects');

const objects = fs.readdirSync(OBJECTS_DIR).filter(f => fs.statSync(path.join(OBJECTS_DIR, f)).isDirectory());

let objPermsXml = '';
let fieldPermsXml = '';
let tabSettingsXml = '';

for (const obj of objects) {
    // Object permissions
    objPermsXml += `
    <objectPermissions>
        <allowCreate>true</allowCreate>
        <allowDelete>true</allowDelete>
        <allowEdit>true</allowEdit>
        <allowRead>true</allowRead>
        <modifyAllRecords>true</modifyAllRecords>
        <object>${obj}</object>
        <viewAllRecords>true</viewAllRecords>
    </objectPermissions>`;

    // Tab Settings
    const tabFile = path.join(BASE_DIR, 'tabs', `${obj}.tab-meta.xml`);
    if (fs.existsSync(tabFile)) {
        tabSettingsXml += `
    <tabSettings>
        <tab>${obj}</tab>
        <visibility>Visible</visibility>
    </tabSettings>`;
    }

    // Fields permissions
    const fieldsDir = path.join(OBJECTS_DIR, obj, 'fields');
    if (fs.existsSync(fieldsDir)) {
        const fieldFiles = fs.readdirSync(fieldsDir).filter(f => f.endsWith('.field-meta.xml'));
        for (const ff of fieldFiles) {
            const fieldName = ff.replace('.field-meta.xml', '');
            const content = fs.readFileSync(path.join(fieldsDir, ff), 'utf8');

            const isFormula = content.includes('<formula>');
            const isMasterDetail = content.includes('<type>MasterDetail</type>');
            const isAutoNumber = content.includes('<type>AutoNumber</type>');
            const isRollup = content.includes('<type>Summary</type>');
            const isRequired = content.includes('<required>true</required>');

            // In Salesforce, required and Master-Detail fields cannot have fieldPermissions
            if (isMasterDetail || isRequired) {
                continue;
            }

            const isEditable = !isFormula && !isAutoNumber && !isRollup;

            fieldPermsXml += `
    <fieldPermissions>
        <editable>${isEditable ? 'true' : 'false'}</editable>
        <field>${obj}.${fieldName}</field>
        <readable>true</readable>
    </fieldPermissions>`;
        }
    }
}

// Also add ECommerce_Hub tab to tabSettings
tabSettingsXml += `
    <tabSettings>
        <tab>ECommerce_Hub</tab>
        <visibility>Visible</visibility>
    </tabSettings>`;

const permSetContent = `<?xml version="1.0" encoding="UTF-8"?>
<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">
    <description>Full SuperAdmin access to all E-Commerce objects, fields, and tabs</description>
    <hasActivationRequired>false</hasActivationRequired>
    <label>E-Commerce Admin Full Access</label>${fieldPermsXml}${objPermsXml}${tabSettingsXml}
</PermissionSet>
`;

const targetFile = path.join(BASE_DIR, 'permissionsets', 'ECommerce_Admin_Full_Access.permissionset-meta.xml');
fs.writeFileSync(targetFile, permSetContent.trim() + '\n', 'utf8');
console.log('Created ECommerce_Admin_Full_Access.permissionset-meta.xml');
