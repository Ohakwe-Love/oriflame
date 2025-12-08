# Backend Functions Specification (Laravel E-commerce)

This document outlines core backend modules required for the e-commerce platform.  
The system contains two roles:

- **Guest** – browse only
- **User** – purchase, manage profile, view orders
- **Admin** – manage products, orders, users, content, analytics

---

## 1. Product / Catalog Management

### Purpose  
Manage products and their metadata.

### Features  
- Create, update, delete products  
- Product categories and sub-categories  
- Product attributes (size)  
- Product images  
- Price and discount price  
- Stock availability  
- SEO fields (slug, meta title, meta description)

---

## 2. Inventory & Stock Control

### Purpose  
Maintain real-time availability of products.

### Features  
- Track stock quantity  
- Decrease stock on order creation  
- Handle stock-out status  
- Restock products  
- Stock alerts (optional)

---

## 3. Shopping Cart & Checkout

### Purpose  
Support purchasing workflow.

### Features  
- Add items to cart  
- Update quantity  
- Remove items  
- Guest cart (session-based)  
- User cart (database-based)  
- Show subtotal, shipping, total  
- Checkout workflow  
- Payment gateway integration  
- Order creation on successful payment  

---

## 4. User / Customer Management

### Purpose  
Manage user profiles and permissions.

### Roles  
- **User**
- **Admin**

### Features  
- Register / login  
- Profile and address management  
- Saved addresses (shipping)  
- Order history  
- Password reset  
- Admin role restriction

---

## 5. Order Management & Fulfilment Workflow

### Purpose  
Manage order lifecycle.

### Order Model  
Order contains:
- User
- Items
- Amount
- Status
- Payment status

### Statuses  
- Pending  
- Paid  
- Shipped  
- Delivered  
- Cancelled  

### Features  
- Track order progress  
- Admin view of all orders  
- Update status  
- Shipping tracking number (optional)  
- Refund handling (optional)

---

## 6. Payment Processing & Methods

### Purpose  
Process user payments securely.

### Features  
- Card payments  
- Local gateways (e.g. Paystack/Flutterwave)  
- Confirm payment via webhook  
- Manual bank transfer (optional)  
- Store payment receipt/transaction id  

---

## 7. Promotions / Discounts / Loyalty (Optional MVP)

### Purpose  
Increase user engagement and conversion.

### Features  
- Discount codes  
- Automatic seasonal sales  
- Percentage or fixed amount  
- Apply discount during checkout  

**Deferred**  
- Loyalty points  
- Subscription system  

---

## 8. Content / CMS & SEO Management (Basic)

### Purpose  
Support marketing website pages.

### Features  
- Manage static pages (About, FAQ, Contact)  
- SEO-friendly URLs  
- Manage homepage hero banners  
- Blog support (optional)  

---

## 9. Reports & Analytics (Basic MVP)

### Purpose  
Provide admin insight into business metrics.

### Features  
- Sales totals  
- Orders by date  
- Top selling products  
- Low stock items  

**Deferred**
- Detailed dashboards  
- Customer segmentation  

---

## 10. Security, Privacy, and Compliance

### Purpose  
Protect user data and secure flows.

### Features  
- Authentication and authorization  
- Rate limiting  
- CSRF protection  
- Validation rules  
- Encrypted passwords  
- Secure payment callback routes  
- GDPR-friendly privacy policy  

---

# 7-Day Development Plan (Laravel)

This schedule is **aggressive but realistic** for a working MVP.

---

## **Day 1 – Environment + Auth + Roles**
- Setup Laravel project  
- Auth scaffolding  
- Seed admin user  
- Middleware for roles (user/admin)  
- Auth guards  
- Dashboard layouts  

---

## **Day 2 – Product & Category Management**
- Product model, migration, controller  
- Category model and relations  
- CRUD UI for admin  
- Image upload  
- Slugs  

---

## **Day 3 – Cart (Guest + User)**
- Session cart for guests  
- DB cart for users  
- Add/update/remove items  
- Cart sync on login  
- Cart totals  

---

## **Day 4 – Checkout + Orders**
- Checkout form  
- Order model & migrations  
- Order items  
- Create order after checkout  
- Stock reduction  

---

## **Day 5 – Payment Integration**
Pick one:
- Paystack  
- Flutterwave  
- Stripe  

---

## **Day 6 – User Dashboard**
- Order history  
- Order details page  
- Profile + addresses  
- Password change  
- "Track order" basic view  

---

## **Day 7 – Admin Order Management + Reports**
- View all orders  
- Edit status  
- Export orders (optional)  
- Basic stats: total orders, total sales, low stock  

---

# Deployment Targets (Optional)
- VPS or shared hosting  
- MySQL + Redis  
- Queue worker  
- Cloud storage  

---

# Priority List (MVP Essentials)
Must-have:
- Auth  
- Products + categories  
- Cart  
- Checkout  
- Payment  
- Order management  

Add later:
- Discount system  
- Blog/CMS  
- Analytics  
- Loyalty points  

---

# Goal
Working e-commerce MVP in **7 days**.
