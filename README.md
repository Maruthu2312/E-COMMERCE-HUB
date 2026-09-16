# E-COMMERCE-HUB

⚡ Advanced Salesforce E-Commerce & CRM Platform

An enterprise-grade, full-stack 🛒 E-Commerce & 🤝 Customer Relationship Management (CRM) solution built natively on the ☁️ Salesforce Platform using ⚡ Lightning Web Components (LWC) and an 🔧 Apex Enterprise Service Layer.

🌟 Key Features

🛒 1. Interactive Digital Storefront

📦 Dynamic Product Catalog — Real-time category filtering, responsive product grids, and badge indicators.

🔎 Smart Search & Sort — Keyword search, category filters, and sorting by price, rating, featured products, and discounts.

📝 Product Details Modal — Product specifications, stock status, brand badges, images, and quantity controls.

❤️ Wishlist Management — Save favorite products using Wishlist__c.


💳 2. Real-Time Shopping Cart & Multi-Gateway Checkout

🛍️ Slide-Out Cart Drawer — Live item count, quantity updates, item removal, and automatic subtotal calculation.

🎟️ Coupons & Promotional Engine — Coupon validation and percentage/fixed discounts through CouponService.

💰 Checkout Processing — Mock checkout support for UPI (GPay/PhonePe), Credit/Debit Cards, and Net Banking.


📊 3. Executive CRM & Operations Command Center

📈 Live KPI Dashboard — Revenue, orders, active customers, and inventory metrics.

⚠️ Low-Stock Alerts & Restocking — Detect low-stock products and perform restocking operations.

📦 Order & Reverse Logistics Hub — Order timelines, customer information, courier tracking, returns, and refunds.

🏗️ Architecture & Data Model

The system connects customers, products, orders, payments, shipments, returns, refunds, inventory, loyalty, reviews, and wishlists through Salesforce custom objects.


🗂️ Core Custom Objects

🧩 Object	📋 Description

👤 Customer__c	Customer demographics, loyalty tiers, and lifetime value

📦 Product__c	Product SKUs, inventory, pricing, and discounts

🗃️ Category__c	Product taxonomy and categories

🛒 Order__c / Order_Item__c	Orders and order line items

💳 Payment__c	Payment transactions and gateway references

🚚 Shipment__c	Logistics and shipment tracking

↩️ Return__c / Refund__c	Returns and refund processing

🛍️ Cart__c / Cart_Item__c	Shopping carts and selected products

🎟️ Coupon__c	Discount and coupon rules

📊 Inventory_Transaction__c	Inventory audit ledger

⭐ Loyalty_Transaction__c	Customer reward points

⭐ Review__c	Customer ratings and reviews

❤️ Wishlist__c	Saved products

⚡ Apex Architecture

The backend uses an Enterprise Service-Oriented Architecture with separation of concerns:


🎮 Controller: ECommerceController.cls

📦 Product Service: ProductService.cls

📊 Inventory Service: InventoryService.cls

🛒 Order Service: OrderService.cls

💳 Payment Service: PaymentService.cls

🎟️ Coupon Service: CouponService.cls

🏆 Loyalty Service: LoyaltyService.cls

↩️ Return & Refund Services: ReturnService.cls, RefundService.cls

🔥 Trigger Layer: Order, Order Item, Payment, and Return triggers with dedicated handlers.

🧪 Automated Testing & Quality

🧪 Test Classes: 7 listed service/controller test classes

✅ Test Pass Rate: 100%

📊 Org-Wide Apex Coverage: 87%

🚀 The README states that the coverage exceeds Salesforce's 75% deployment threshold.

🚀 Quickstart & Deployment

💻 Install Salesforce CLI (sf)

🔐 Connect your Salesforce Developer/Scratch Org

📤 Deploy the metadata

🔑 Assign required permission sets

🌱 Seed sample data

🧪 Run Apex tests

🌐 Open the E-Commerce CRM application.

📁 Repository Structure


📦 E-COMMERCE-HUB

├── 📄 .gitignore

├── 📄 README.md

├── 📄 sfdx-project.json

├── 📁 manifest/

│   └── 📄 package.xml

├── 📁 scripts/

│   ├── 📄 insert_sample_data.apex

│   └── 📄 generate_*.js

└── 📁 force-app/main/default/

    ├── 📱 applications/
    
    ├── ⚡ classes/
    
    ├── 🔐 cspTrustedSites/
    
    ├── 📐 flexipages/
    
    ├── 💻 lwc/
    
    │   ├── 📊 adminDashboard/
    
    │   ├── 💳 checkoutPage/
    
    │   ├── 🏪 ecommerceDashboard/
    
    │   ├── 🛍️ productCard/
    
    │   ├── 📦 productCatalog/
    
    │   ├── 📝 productDetails/
    
    │   ├── 🔎 productSearch/
    
    │   └── 🛒 shoppingCart/
    
    ├── 🗂️ objects/
    
    ├── 🔑 permissionsets/
    
    ├── 🌐 remoteSiteSettings/
    
    ├── 📑 tabs/
    
    └── 🔥 triggers/



The Salesforce DX configuration uses force-app as the default package directory and Salesforce API v60.0.
