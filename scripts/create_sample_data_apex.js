const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const APEX_FILE = path.join(ROOT_DIR, 'scripts', 'insert_sample_data.apex');

console.log('Generating comprehensive Indian Market sample data script...');

const apexCode = `
// ==============================================================================
// ADVANCED SALESFORCE E-COMMERCE CRM - SAMPLE DATA POPULATION SCRIPT
// Market: Indian E-Commerce (INR ₹)
// Complies with all validation rules, triggers, and relational schemas.
// ==============================================================================

System.debug('Starting E-Commerce CRM Sample Data Seeding...');

// 1. CREATE CATEGORIES (8 Categories)
List<Category__c> categories = new List<Category__c>{
    new Category__c(Name = 'Smartphones & Accessories', Category_Code__c = 'CAT-MOBILES', Category_Status__c = 'Active', Description__c = 'Latest 5G smartphones, chargers, and mobile cases.'),
    new Category__c(Name = 'Laptops & Computers', Category_Code__c = 'CAT-LAPTOPS', Category_Status__c = 'Active', Description__c = 'Ultrabooks, gaming rigs, keyboards, and PC peripherals.'),
    new Category__c(Name = 'Audio & Wearables', Category_Code__c = 'CAT-AUDIO', Category_Status__c = 'Active', Description__c = 'TWS earbuds, noise cancelling headphones, smartwatches.'),
    new Category__c(Name = 'Smart Home Appliances', Category_Code__c = 'CAT-APPLIANCES', Category_Status__c = 'Active', Description__c = 'Air purifiers, robotic vacuums, smart LED bulbs.'),
    new Category__c(Name = 'Ethnic & Casual Fashion', Category_Code__c = 'CAT-FASHION', Category_Status__c = 'Active', Description__c = 'Kurtas, shirts, denim, and seasonal footwear.'),
    new Category__c(Name = 'Home & Kitchen Decor', Category_Code__c = 'CAT-HOME', Category_Status__c = 'Active', Description__c = 'Cookware sets, stainless steel flasks, ergonomic chairs.'),
    new Category__c(Name = 'Fitness & Sports Gear', Category_Code__c = 'CAT-FITNESS', Category_Status__c = 'Active', Description__c = 'Yoga mats, resistance bands, whey protein, dumbbells.'),
    new Category__c(Name = 'Books & Learning Tech', Category_Code__c = 'CAT-BOOKS', Category_Status__c = 'Active', Description__c = 'E-readers, programming books, self-development bestsellers.')
};
insert categories;
System.debug('Inserted ' + categories.size() + ' Categories.');

// 2. CREATE PRODUCTS (32 Products across all categories)
List<Product__c> products = new List<Product__c>{
    // Mobiles
    new Product__c(Name = 'OnePlus 12 5G (16GB RAM, 512GB)', Product_Code__c = 'PROD-OP12-512', Category__c = categories[0].Id, Brand__c = 'OnePlus', Price__c = 69999.00, Discount_Percentage__c = 10.0, Tax_Percentage__c = 18.0, Stock_Quantity__c = 45, Reorder_Level__c = 10, Rating__c = 4.8, Product_Status__c = 'Active', Product_Image_URL__c = 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500'),
    new Product__c(Name = 'Samsung Galaxy S24 Ultra', Product_Code__c = 'PROD-S24-ULTRA', Category__c = categories[0].Id, Brand__c = 'Samsung', Price__c = 129999.00, Discount_Percentage__c = 8.0, Tax_Percentage__c = 18.0, Stock_Quantity__c = 25, Reorder_Level__c = 5, Rating__c = 4.9, Product_Status__c = 'Active', Product_Image_URL__c = 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500'),
    new Product__c(Name = 'Realme Narzo 60x 5G', Product_Code__c = 'PROD-RN-60X', Category__c = categories[0].Id, Brand__c = 'Realme', Price__c = 14499.00, Discount_Percentage__c = 15.0, Tax_Percentage__c = 18.0, Stock_Quantity__c = 80, Reorder_Level__c = 15, Rating__c = 4.3, Product_Status__c = 'Active', Product_Image_URL__c = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'),
    new Product__c(Name = '65W SuperVOOC Dual Port Charger', Product_Code__c = 'PROD-CHG-65W', Category__c = categories[0].Id, Brand__c = 'OnePlus', Price__c = 2999.00, Discount_Percentage__c = 5.0, Tax_Percentage__c = 18.0, Stock_Quantity__c = 150, Reorder_Level__c = 20, Rating__c = 4.7, Product_Status__c = 'Active', Product_Image_URL__c = 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500'),
    
    // Laptops
    new Product__c(Name = 'MacBook Air M3 (16GB, 512GB SSD)', Product_Code__c = 'PROD-MBA-M3', Category__c = categories[1].Id, Brand__c = 'Apple', Price__c = 134900.00, Discount_Percentage__c = 7.0, Tax_Percentage__c = 18.0, Stock_Quantity__c = 30, Reorder_Level__c = 8, Rating__c = 4.9, Product_Status__c = 'Active', Product_Image_URL__c = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'),
    new Product__c(Name = 'ASUS ROG Zephyrus G16 Gaming Laptop', Product_Code__c = 'PROD-ASUS-G16', Category__c = categories[1].Id, Brand__c = 'ASUS', Price__c = 179990.00, Discount_Percentage__c = 12.0, Tax_Percentage__c = 18.0, Stock_Quantity__c = 15, Reorder_Level__c = 4, Rating__c = 4.7, Product_Status__c = 'Active', Product_Image_URL__c = 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500'),
    new Product__c(Name = 'Logitech MX Master 3S Wireless Mouse', Product_Code__c = 'PROD-MX-3S', Category__c = categories[1].Id, Brand__c = 'Logitech', Price__c = 8995.00, Discount_Percentage__c = 10.0, Tax_Percentage__c = 18.0, Stock_Quantity__c = 60, Reorder_Level__c = 12, Rating__c = 4.9, Product_Status__c = 'Active', Product_Image_URL__c = 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500'),
    new Product__c(Name = 'Keychron K2 V2 Wireless Mechanical Keyboard', Product_Code__c = 'PROD-KEY-K2', Category__c = categories[1].Id, Brand__c = 'Keychron', Price__c = 7499.00, Discount_Percentage__c = 5.0, Tax_Percentage__c = 18.0, Stock_Quantity__c = 40, Reorder_Level__c = 10, Rating__c = 4.8, Product_Status__c = 'Active', Product_Image_URL__c = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500'),

    // Audio & Wearables
    new Product__c(Name = 'Sony WH-1000XM5 Noise Cancelling Headphones', Product_Code__c = 'PROD-SONY-XM5', Category__c = categories[2].Id, Brand__c = 'Sony', Price__c = 29990.00, Discount_Percentage__c = 15.0, Tax_Percentage__c = 18.0, Stock_Quantity__c = 35, Reorder_Level__c = 8, Rating__c = 4.9, Product_Status__c = 'Active', Product_Image_URL__c = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'),
    new Product__c(Name = 'Apple AirPods Pro (2nd Gen, USB-C)', Product_Code__c = 'PROD-AIRPODS-PRO', Category__c = categories[2].Id, Brand__c = 'Apple', Price__c = 24900.00, Discount_Percentage__c = 6.0, Tax_Percentage__c = 18.0, Stock_Quantity__c = 50, Reorder_Level__c = 10, Rating__c = 4.8, Product_Status__c = 'Active', Product_Image_URL__c = 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500'),
    new Product__c(Name = 'Samsung Galaxy Watch 6 Classic LTE', Product_Code__c = 'PROD-GW-6', Category__c = categories[2].Id, Brand__c = 'Samsung', Price__c = 36999.00, Discount_Percentage__c = 20.0, Tax_Percentage__c = 18.0, Stock_Quantity__c = 20, Reorder_Level__c = 5, Rating__c = 4.6, Product_Status__c = 'Active', Product_Image_URL__c = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'),
    new Product__c(Name = 'boAt Airdopes 141 ANC Earbuds', Product_Code__c = 'PROD-BOAT-141', Category__c = categories[2].Id, Brand__c = 'boAt', Price__c = 1499.00, Discount_Percentage__c = 30.0, Tax_Percentage__c = 18.0, Stock_Quantity__c = 200, Reorder_Level__c = 30, Rating__c = 4.2, Product_Status__c = 'Active', Product_Image_URL__c = 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500'),

    // Home Appliances
    new Product__c(Name = 'Dyson V12 Detect Slim Cordless Vacuum', Product_Code__c = 'PROD-DYSON-V12', Category__c = categories[3].Id, Brand__c = 'Dyson', Price__c = 49900.00, Discount_Percentage__c = 10.0, Tax_Percentage__c = 18.0, Stock_Quantity__c = 12, Reorder_Level__c = 3, Rating__c = 4.8, Product_Status__c = 'Active', Product_Image_URL__c = 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500'),
    new Product__c(Name = 'Philips Smart Wi-Fi LED Bulb 9W', Product_Code__c = 'PROD-PHIL-BULB', Category__c = categories[3].Id, Brand__c = 'Philips', Price__c = 799.00, Discount_Percentage__c = 25.0, Tax_Percentage__c = 18.0, Stock_Quantity__c = 120, Reorder_Level__c = 25, Rating__c = 4.5, Product_Status__c = 'Active', Product_Image_URL__c = 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=500'),

    // Fashion
    new Product__c(Name = 'FabIndia Pure Cotton Handblock Kurta', Product_Code__c = 'PROD-FAB-KURTA', Category__c = categories[4].Id, Brand__c = 'FabIndia', Price__c = 2499.00, Discount_Percentage__c = 15.0, Tax_Percentage__c = 12.0, Stock_Quantity__c = 60, Reorder_Level__c = 10, Rating__c = 4.7, Product_Status__c = 'Active', Product_Image_URL__c = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500'),
    new Product__c(Name = 'Levi\\'s 511 Slim Fit Stretch Denim', Product_Code__c = 'PROD-LEVI-511', Category__c = categories[4].Id, Brand__c = 'Levi\\'s', Price__c = 3999.00, Discount_Percentage__c = 20.0, Tax_Percentage__c = 12.0, Stock_Quantity__c = 45, Reorder_Level__c = 8, Rating__c = 4.6, Product_Status__c = 'Active', Product_Image_URL__c = 'https://images.unsplash.com/photo-1542272604-780c96856592?w=500'),

    // Home & Kitchen
    new Product__c(Name = 'Prestige Deluxe Alpha Stainless Steel Cooker (3L)', Product_Code__c = 'PROD-PRES-3L', Category__c = categories[5].Id, Brand__c = 'Prestige', Price__c = 2850.00, Discount_Percentage__c = 18.0, Tax_Percentage__c = 18.0, Stock_Quantity__c = 55, Reorder_Level__c = 10, Rating__c = 4.7, Product_Status__c = 'Active', Product_Image_URL__c = 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500'),
    new Product__c(Name = 'Milton Thermosteel Flip Lid Flask 1000ml', Product_Code__c = 'PROD-MILT-1L', Category__c = categories[5].Id, Brand__c = 'Milton', Price__c = 1150.00, Discount_Percentage__c = 12.0, Tax_Percentage__c = 18.0, Stock_Quantity__c = 90, Reorder_Level__c = 15, Rating__c = 4.6, Product_Status__c = 'Active', Product_Image_URL__c = 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500'),

    // Fitness
    new Product__c(Name = 'Optimum Nutrition Gold Standard 100% Whey (2kg)', Product_Code__c = 'PROD-ON-WHEY-2KG', Category__c = categories[6].Id, Brand__c = 'Optimum Nutrition', Price__c = 6899.00, Discount_Percentage__c = 10.0, Tax_Percentage__c = 18.0, Stock_Quantity__c = 40, Reorder_Level__c = 8, Rating__c = 4.8, Product_Status__c = 'Active', Product_Image_URL__c = 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500'),
    new Product__c(Name = 'Boldfit Anti-Slip High Density Yoga Mat (6mm)', Product_Code__c = 'PROD-BOLD-YOGA', Category__c = categories[6].Id, Brand__c = 'Boldfit', Price__c = 1299.00, Discount_Percentage__c = 30.0, Tax_Percentage__c = 18.0, Stock_Quantity__c = 75, Reorder_Level__c = 12, Rating__c = 4.5, Product_Status__c = 'Active', Product_Image_URL__c = 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'),

    // Books
    new Product__c(Name = 'Kindle Paperwhite (16GB, 6.8\\" Display)', Product_Code__c = 'PROD-KINDLE-PW', Category__c = categories[7].Id, Brand__c = 'Amazon', Price__c = 14999.00, Discount_Percentage__c = 10.0, Tax_Percentage__c = 18.0, Stock_Quantity__c = 28, Reorder_Level__c = 6, Rating__c = 4.9, Product_Status__c = 'Active', Product_Image_URL__c = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'),
    new Product__c(Name = 'Designing Data-Intensive Applications by Martin Kleppmann', Product_Code__c = 'PROD-BK-DDIA', Category__c = categories[7].Id, Brand__c = 'O\\'Reilly', Price__c = 1899.00, Discount_Percentage__c = 15.0, Tax_Percentage__c = 0.0, Stock_Quantity__c = 50, Reorder_Level__c = 10, Rating__c = 5.0, Product_Status__c = 'Active', Product_Image_URL__c = 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=500')
};
insert products;
System.debug('Inserted ' + products.size() + ' Products.');

// 3. CREATE COUPONS (5 Active Promo Codes)
List<Coupon__c> coupons = new List<Coupon__c>{
    new Coupon__c(Name = 'WELCOME10', Coupon_Code__c = 'WELCOME10', Coupon_Name__c = 'First Order Welcome Offer', Discount_Type__c = 'Percentage', Discount_Value__c = 10.0, Minimum_Order_Amount__c = 999.00, Maximum_Discount__c = 500.00, Start_Date__c = Date.today().addDays(-30), End_Date__c = Date.today().addDays(90), Usage_Limit__c = 1000, Coupon_Status__c = 'Active'),
    new Coupon__c(Name = 'DIWALI20', Coupon_Code__c = 'DIWALI20', Coupon_Name__c = 'Festive Mega Savings', Discount_Type__c = 'Percentage', Discount_Value__c = 20.0, Minimum_Order_Amount__c = 4999.00, Maximum_Discount__c = 3000.00, Start_Date__c = Date.today().addDays(-10), End_Date__c = Date.today().addDays(45), Usage_Limit__c = 500, Coupon_Status__c = 'Active'),
    new Coupon__c(Name = 'FLAT500', Coupon_Code__c = 'FLAT500', Coupon_Name__c = 'Flat ₹500 Instant Cashback', Discount_Type__c = 'Fixed Amount', Discount_Value__c = 500.0, Minimum_Order_Amount__c = 2500.00, Maximum_Discount__c = 500.00, Start_Date__c = Date.today().addDays(-15), End_Date__c = Date.today().addDays(60), Usage_Limit__c = 300, Coupon_Status__c = 'Active'),
    new Coupon__c(Name = 'VIPEXCLUSIVE', Coupon_Code__c = 'VIPEXCLUSIVE', Coupon_Name__c = 'VIP Club 25% Off', Discount_Type__c = 'Percentage', Discount_Value__c = 25.0, Minimum_Order_Amount__c = 10000.00, Maximum_Discount__c = 5000.00, Start_Date__c = Date.today().addDays(-20), End_Date__c = Date.today().addDays(120), Usage_Limit__c = 150, Coupon_Status__c = 'Active'),
    new Coupon__c(Name = 'FREESHIP', Coupon_Code__c = 'FREESHIP', Coupon_Name__c = 'Free Shipping Code', Discount_Type__c = 'Fixed Amount', Discount_Value__c = 50.0, Minimum_Order_Amount__c = 499.00, Maximum_Discount__c = 50.00, Start_Date__c = Date.today().addDays(-5), End_Date__c = Date.today().addDays(30), Usage_Limit__c = 2000, Coupon_Status__c = 'Active')
};
insert coupons;
System.debug('Inserted ' + coupons.size() + ' Coupons.');

// 4. CREATE CUSTOMERS (12 Real-World Indian Customer Profiles)
List<Customer__c> customers = new List<Customer__c>{
    new Customer__c(Customer_Name__c = 'Aarav Sharma', Email__c = 'aarav.sharma@example.in', Phone__c = '+91 9820123456', City__c = 'Mumbai', State__c = 'Maharashtra', Postal_Code__c = '400050', Country__c = 'India', Customer_Type__c = 'VIP', Customer_Status__c = 'Active', Registration_Date__c = Date.today().addDays(-120), Loyalty_Points__c = 1250, Total_Spending__c = 125000.00),
    new Customer__c(Customer_Name__c = 'Priya Patel', Email__c = 'priya.patel@example.in', Phone__c = '+91 9425123890', City__c = 'Ahmedabad', State__c = 'Gujarat', Postal_Code__c = '380015', Country__c = 'India', Customer_Type__c = 'Platinum', Customer_Status__c = 'Active', Registration_Date__c = Date.today().addDays(-90), Loyalty_Points__c = 680, Total_Spending__c = 68000.00),
    new Customer__c(Customer_Name__c = 'Rohan Iyer', Email__c = 'rohan.iyer@example.in', Phone__c = '+91 9840987654', City__c = 'Chennai', State__c = 'Tamil Nadu', Postal_Code__c = '600028', Country__c = 'India', Customer_Type__c = 'Gold', Customer_Status__c = 'Active', Registration_Date__c = Date.today().addDays(-60), Loyalty_Points__c = 340, Total_Spending__c = 34000.00),
    new Customer__c(Customer_Name__c = 'Ananya Sen', Email__c = 'ananya.sen@example.in', Phone__c = '+91 9830543210', City__c = 'Kolkata', State__c = 'West Bengal', Postal_Code__c = '700019', Country__c = 'India', Customer_Type__c = 'Silver', Customer_Status__c = 'Active', Registration_Date__c = Date.today().addDays(-45), Loyalty_Points__c = 180, Total_Spending__c = 18000.00),
    new Customer__c(Customer_Name__c = 'Vikram Malhotra', Email__c = 'vikram.m@example.in', Phone__c = '+91 9811234567', City__c = 'New Delhi', State__c = 'Delhi', Postal_Code__c = '110001', Country__c = 'India', Customer_Type__c = 'VIP', Customer_Status__c = 'Active', Registration_Date__c = Date.today().addDays(-150), Loyalty_Points__c = 1950, Total_Spending__c = 195000.00),
    new Customer__c(Customer_Name__c = 'Neha Reddy', Email__c = 'neha.reddy@example.in', Phone__c = '+91 9849012345', City__c = 'Hyderabad', State__c = 'Telangana', Postal_Code__c = '500081', Country__c = 'India', Customer_Type__c = 'Gold', Customer_Status__c = 'Active', Registration_Date__c = Date.today().addDays(-50), Loyalty_Points__c = 420, Total_Spending__c = 42000.00),
    new Customer__c(Customer_Name__c = 'Aditya Kulkarni', Email__c = 'aditya.k@example.in', Phone__c = '+91 9822334455', City__c = 'Pune', State__c = 'Maharashtra', Postal_Code__c = '411038', Country__c = 'India', Customer_Type__c = 'Regular', Customer_Status__c = 'Active', Registration_Date__c = Date.today().addDays(-10), Loyalty_Points__c = 50, Total_Spending__c = 5000.00),
    new Customer__c(Customer_Name__c = 'Kavita Nair', Email__c = 'kavita.nair@example.in', Phone__c = '+91 9447123456', City__c = 'Kochi', State__c = 'Kerala', Postal_Code__c = '682016', Country__c = 'India', Customer_Type__c = 'Silver', Customer_Status__c = 'Active', Registration_Date__c = Date.today().addDays(-25), Loyalty_Points__c = 120, Total_Spending__c = 12000.00),
    new Customer__c(Customer_Name__c = 'Manish Verma', Email__c = 'manish.v@example.in', Phone__c = '+91 9711889900', City__c = 'Noida', State__c = 'Uttar Pradesh', Postal_Code__c = '201301', Country__c = 'India', Customer_Type__c = 'Regular', Customer_Status__c = 'Active', Registration_Date__c = Date.today().addDays(-5), Loyalty_Points__c = 0, Total_Spending__c = 0.00),
    new Customer__c(Customer_Name__c = 'Divya Rao', Email__c = 'divya.rao@example.in', Phone__c = '+91 9900112233', City__c = 'Bengaluru', State__c = 'Karnataka', Postal_Code__c = '560034', Country__c = 'India', Customer_Type__c = 'Platinum', Customer_Status__c = 'Active', Registration_Date__c = Date.today().addDays(-80), Loyalty_Points__c = 850, Total_Spending__c = 85000.00),
    new Customer__c(Customer_Name__c = 'Suresh Menon', Email__c = 'suresh.m@example.in', Phone__c = '+91 9895012345', City__c = 'Thiruvananthapuram', State__c = 'Kerala', Postal_Code__c = '695001', Country__c = 'India', Customer_Type__c = 'Regular', Customer_Status__c = 'Active', Registration_Date__c = Date.today().addDays(-15), Loyalty_Points__c = 80, Total_Spending__c = 8000.00),
    new Customer__c(Customer_Name__c = 'Meera Joshi', Email__c = 'meera.joshi@example.in', Phone__c = '+91 9826012345', City__c = 'Indore', State__c = 'Madhya Pradesh', Postal_Code__c = '452001', Country__c = 'India', Customer_Type__c = 'Gold', Customer_Status__c = 'Active', Registration_Date__c = Date.today().addDays(-40), Loyalty_Points__c = 310, Total_Spending__c = 31000.00)
};
insert customers;
System.debug('Inserted ' + customers.size() + ' Customers.');

// 5. CREATE ORDERS (20 Orders)
List<Order__c> orders = new List<Order__c>();
for (Integer i = 0; i < 20; i++) {
    Customer__c cust = customers[Math.mod(i, customers.size())];
    String status = i < 5 ? 'Confirmed' : (i < 10 ? 'Shipped' : (i < 16 ? 'Delivered' : (i < 18 ? 'Completed' : 'Draft')));
    String pmtStatus = status == 'Draft' ? 'Pending' : 'Paid';
    String shipStatus = status == 'Draft' || status == 'Confirmed' ? 'Not Shipped' : (status == 'Shipped' ? 'Shipped' : 'Delivered');

    orders.add(new Order__c(
        Customer__c = cust.Id,
        Order_Date__c = System.now().addDays(-20 + i),
        Order_Status__c = status,
        Payment_Status__c = pmtStatus,
        Shipping_Status__c = shipStatus,
        Shipping_Address__c = cust.City__c + ', ' + cust.State__c + ' - ' + cust.Postal_Code__c,
        Billing_Address__c = cust.City__c + ', ' + cust.State__c + ' - ' + cust.Postal_Code__c,
        Shipping_Charge__c = 50.00,
        Discount__c = 500.00,
        Tax__c = 2500.00,
        Subtotal__c = 15000.00,
        Actual_Delivery_Date__c = (status == 'Delivered' || status == 'Completed') ? Date.today().addDays(-5 + Math.mod(i, 4)) : null
    ));
}
insert orders;
System.debug('Inserted ' + orders.size() + ' Orders.');

// 6. CREATE ORDER ITEMS (50+ Order Line Items)
List<Order_Item__c> orderItems = new List<Order_Item__c>();
for (Integer i = 0; i < orders.size(); i++) {
    Order__c ord = orders[i];
    Product__c p1 = products[Math.mod(i * 2, products.size())];
    Product__c p2 = products[Math.mod(i * 2 + 1, products.size())];
    Product__c p3 = products[Math.mod(i * 2 + 2, products.size())];

    orderItems.add(new Order_Item__c(Order__c = ord.Id, Product__c = p1.Id, Quantity__c = 1, Unit_Price__c = p1.Price__c, Tax__c = p1.Price__c * 0.18));
    orderItems.add(new Order_Item__c(Order__c = ord.Id, Product__c = p2.Id, Quantity__c = 2, Unit_Price__c = p2.Price__c, Tax__c = p2.Price__c * 0.18 * 2));
    if (Math.mod(i, 2) == 0) {
        orderItems.add(new Order_Item__c(Order__c = ord.Id, Product__c = p3.Id, Quantity__c = 1, Unit_Price__c = p3.Price__c, Tax__c = p3.Price__c * 0.18));
    }
}
insert orderItems;
System.debug('Inserted ' + orderItems.size() + ' Order Items.');

// 7. CREATE PAYMENTS (20 Payments)
List<Payment__c> payments = new List<Payment__c>();
List<String> pmtMethods = new List<String>{'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash on Delivery'};
for (Integer i = 0; i < orders.size(); i++) {
    Order__c ord = orders[i];
    payments.add(new Payment__c(
        Order__c = ord.Id,
        Customer__c = ord.Customer__c,
        Amount__c = 17050.00,
        Payment_Method__c = pmtMethods[Math.mod(i, pmtMethods.size())],
        Payment_Status__c = ord.Payment_Status__c == 'Paid' ? 'Successful' : 'Pending',
        Transaction_ID__c = 'TXN-IN-' + String.valueOf(100000 + i),
        Payment_Date__c = System.now().addDays(-20 + i)
    ));
}
insert payments;
System.debug('Inserted ' + payments.size() + ' Payments.');

// 8. CREATE SHIPMENTS (15 Shipments)
List<Shipment__c> shipments = new List<Shipment__c>();
List<String> couriers = new List<String>{'Blue Dart Express', 'Delhivery Express', 'DTDC Courier', 'Shadowfax'};
for (Integer i = 0; i < 15; i++) {
    Order__c ord = orders[i];
    shipments.add(new Shipment__c(
        Order__c = ord.Id,
        Customer__c = ord.Customer__c,
        Courier_Name__c = couriers[Math.mod(i, couriers.size())],
        Tracking_Number__c = 'TRK-IND-' + String.valueOf(800000 + i),
        Shipping_Address__c = ord.Shipping_Address__c,
        Shipment_Date__c = Date.today().addDays(-15 + i),
        Expected_Delivery_Date__c = Date.today().addDays(-10 + i),
        Shipment_Status__c = i < 5 ? 'Shipped' : 'Delivered',
        Actual_Delivery_Date__c = i >= 5 ? Date.today().addDays(-9 + i) : null
    ));
}
insert shipments;
System.debug('Inserted ' + shipments.size() + ' Shipments.');

// 9. CREATE REVIEWS (20 Reviews)
List<Review__c> reviews = new List<Review__c>();
for (Integer i = 0; i < 20; i++) {
    Product__c p = products[Math.mod(i, products.size())];
    Customer__c c = customers[Math.mod(i, customers.size())];
    reviews.add(new Review__c(
        Product__c = p.Id,
        Customer__c = c.Id,
        Order__c = orders[Math.mod(i, orders.size())].Id,
        Rating__c = Math.mod(i, 2) == 0 ? 5 : 4,
        Review_Title__c = 'Superb quality and prompt shipping!',
        Review_Description__c = 'The product surpassed all expectations. Genuine Indian warranty and rapid delivery.',
        Review_Status__c = 'Approved',
        Review_Date__c = Date.today().addDays(-10 + i)
    ));
}
insert reviews;
System.debug('Inserted ' + reviews.size() + ' Reviews.');

// 10. CREATE WISHLISTS (10 Wishlist Entries)
List<Wishlist__c> wishlists = new List<Wishlist__c>();
for (Integer i = 0; i < 10; i++) {
    wishlists.add(new Wishlist__c(
        Customer__c = customers[i].Id,
        Product__c = products[Math.mod(i + 5, products.size())].Id,
        Added_Date__c = Date.today().addDays(-i),
        Wishlist_Status__c = 'Active'
    ));
}
insert wishlists;
System.debug('Inserted ' + wishlists.size() + ' Wishlists.');

System.debug('=== SAMPLE DATA SEEDING COMPLETE ===');
`;

fs.writeFileSync(APEX_FILE, apexCode.trim() + '\n', 'utf8');
console.log('Sample Data Apex script created at:', APEX_FILE);
