class ShoppingCart {
    static instance;

    constructor(options = {}) {
        // Prevent multiple instances (Singleton)
        if (ShoppingCart.instance) {
            return ShoppingCart.instance;
        }

        this.items = [];
        this.appliedCoupon = null;

        // Configuration
        this.config = {
            taxRate: options.taxRate || 0.1, // 10% default
            includeTax: options.includeTax !== undefined ? options.includeTax : true,
            shippingFeePerItem: options.shippingFeePerItem || 1500, // ₦1500 per item
            includeShipping: options.includeShipping !== undefined ? options.includeShipping : true,
            currency: options.currency || '₦',
            coupons: options.coupons || {
                "SAVE10": 10,
                "SAVE20": 20,
                "SAVE30": 30,
                "WELCOME15": 15,
                "FREESHIP": { type: 'free_shipping' }
            }
        };

        // Event listeners
        this.listeners = {
            cartUpdated: [],
            cartOpened: [],
            cartClosed: [],
            itemAdded: [],
            itemRemoved: [],
            couponApplied: [],
            couponRemoved: []
        };

        // Load cart from memory
        this.loadCart();
        this.listenToStorageChanges();

        ShoppingCart.instance = this;
    }

    // Singleton getter
    static getInstance(options) {
        if (!ShoppingCart.instance) {
            ShoppingCart.instance = new ShoppingCart(options);
        }
        return ShoppingCart.instance;
    }

    // ==================== EVENT SYSTEM ====================

    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
        return this; // Allow chaining
    }

    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
        return this;
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
        // Also dispatch CustomEvent for cross-component communication
        window.dispatchEvent(new CustomEvent(`cart:${event}`, { detail: data }));
    }

    // ==================== CART OPERATIONS ====================

    addItem(product) {
        // Validate product
        if (!product.id || !product.name || product.price === undefined) {
            console.error('Invalid product: must have id, name, and price');
            return false;
        }

        const existingItem = this.items.find(item => item.id === product.id);

        if (existingItem) {
            // Update quantity if item already exists
            existingItem.quantity += product.quantity || 1;
        } else {
            // Add new item
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: product.quantity || 1,
                image: product.image || null,
                category: product.category || null,
                sku: product.sku || null
            });
        }

        this.saveCart();
        this.emit('itemAdded', { product, cart: this.getCartData() });
        this.emit('cartUpdated', this.getCartData());
        return true;
    }

    removeItem(productId) {
        const removedItem = this.items.find(item => item.id === productId);
        this.items = this.items.filter(item => item.id !== productId);

        this.saveCart();
        this.emit('itemRemoved', { item: removedItem, cart: this.getCartData() });
        this.emit('cartUpdated', this.getCartData());
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);

        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.emit('cartUpdated', this.getCartData());
            }
        }
    }

    incrementItem(productId) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity += 1;
            this.saveCart();
            this.emit('cartUpdated', this.getCartData());
        }
    }

    decrementItem(productId) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (item.quantity > 1) {
                item.quantity -= 1;
                this.saveCart();
                this.emit('cartUpdated', this.getCartData());
            } else {
                this.removeItem(productId);
            }
        }
    }

    clearCart() {
        this.items = [];
        this.appliedCoupon = null;
        this.saveCart();
        this.emit('cartUpdated', this.getCartData());
    }

    // ==================== COUPON SYSTEM ====================

    applyCoupon(code) {
        const upperCode = code.trim().toUpperCase();
        const coupon = this.config.coupons[upperCode];

        if (!coupon) {
            return {
                success: false,
                message: 'Invalid coupon code',
                code: upperCode
            };
        }

        // Handle different coupon types
        if (typeof coupon === 'number') {
            // Percentage discount
            this.appliedCoupon = {
                code: upperCode,
                type: 'percentage',
                value: coupon
            };
        } else if (coupon.type === 'free_shipping') {
            // Free shipping coupon
            this.appliedCoupon = {
                code: upperCode,
                type: 'free_shipping',
                value: 0
            };
        }

        this.saveCart();
        const result = {
            success: true,
            message: this.appliedCoupon.type === 'free_shipping'
                ? `Coupon "${upperCode}" applied! Free shipping`
                : `Coupon "${upperCode}" applied! ${this.appliedCoupon.value}% off`,
            coupon: this.appliedCoupon,
            cart: this.getCartData()
        };

        this.emit('couponApplied', result);
        this.emit('cartUpdated', this.getCartData());
        return result;
    }

    removeCoupon() {
        const removedCoupon = this.appliedCoupon;
        this.appliedCoupon = null;
        this.saveCart();

        this.emit('couponRemoved', { coupon: removedCoupon, cart: this.getCartData() });
        this.emit('cartUpdated', this.getCartData());
    }

    getAppliedCoupon() {
        return this.appliedCoupon;
    }

    // ==================== CALCULATIONS ====================

    getSubtotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    getTax() {
        if (!this.config.includeTax) return 0;
        return this.getSubtotal() * this.config.taxRate;
    }

    getShipping() {
        if (!this.config.includeShipping) return 0;

        // Check for free shipping coupon
        if (this.appliedCoupon && this.appliedCoupon.type === 'free_shipping') {
            return 0;
        }

        // Calculate shipping based on total quantity
        const totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
        return totalQuantity * this.config.shippingFeePerItem;
    }

    getDiscount() {
        if (!this.appliedCoupon || this.appliedCoupon.type !== 'percentage') {
            return 0;
        }

        const subtotal = this.getSubtotal();
        return subtotal * (this.appliedCoupon.value / 100);
    }

    getTotal() {
        const subtotal = this.getSubtotal();
        const tax = this.getTax();
        const shipping = this.getShipping();
        const discount = this.getDiscount();

        return subtotal + tax + shipping - discount;
    }

    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    getUniqueItemCount() {
        return this.items.length;
    }

    // ==================== CART DATA & SUMMARY ====================

    getCartData() {
        return {
            items: this.items,
            subtotal: this.getSubtotal(),
            tax: this.getTax(),
            shipping: this.getShipping(),
            discount: this.getDiscount(),
            total: this.getTotal(),
            itemCount: this.getItemCount(),
            uniqueItemCount: this.getUniqueItemCount(),
            appliedCoupon: this.appliedCoupon,
            config: {
                taxRate: this.config.taxRate,
                includeTax: this.config.includeTax,
                includeShipping: this.config.includeShipping,
                currency: this.config.currency
            }
        };
    }

    getCartSummary() {
        const subtotal = this.getSubtotal();
        const tax = this.getTax();
        const shipping = this.getShipping();
        const discount = this.getDiscount();
        const total = this.getTotal();
        const currency = this.config.currency;

        return {
            items: this.items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                category: item.category,
                sku: item.sku,
                lineTotal: item.price * item.quantity,
                lineTotalFormatted: `${currency}${(item.price * item.quantity).toFixed(2)}`
            })),
            subtotal: subtotal,
            subtotalFormatted: `${currency}${subtotal.toFixed(2)}`,
            tax: tax,
            taxFormatted: `${currency}${tax.toFixed(2)}`,
            taxRate: this.config.taxRate,
            taxPercentage: `${(this.config.taxRate * 100).toFixed(0)}%`,
            includeTax: this.config.includeTax,
            shipping: shipping,
            shippingFormatted: `${currency}${shipping.toFixed(2)}`,
            includeShipping: this.config.includeShipping,
            discount: discount,
            discountFormatted: `${currency}${discount.toFixed(2)}`,
            appliedCoupon: this.appliedCoupon,
            total: total,
            totalFormatted: `${currency}${total.toFixed(2)}`,
            itemCount: this.getItemCount(),
            uniqueItemCount: this.getUniqueItemCount(),
            isEmpty: this.items.length === 0,
            currency: currency
        };
    }

    // ==================== UTILITY METHODS ====================

    isCartEmpty() {
        return this.items.length === 0;
    }

    hasItems() {
        return this.items.length > 0;
    }

    isInCart(productId) {
        return this.items.some(item => item.id === productId);
    }

    getItem(productId) {
        return this.items.find(item => item.id === productId);
    }

    // ==================== STORAGE & SYNC ====================

    saveCart() {
        window.__cartData = {
            items: this.items,
            appliedCoupon: this.appliedCoupon,
            config: this.config
        };
    }

    loadCart() {
        if (window.__cartData) {
            this.items = window.__cartData.items || [];
            this.appliedCoupon = window.__cartData.appliedCoupon || null;
            // Merge saved config with defaults
            if (window.__cartData.config) {
                this.config = { ...this.config, ...window.__cartData.config };
            }
        }
    }

    listenToStorageChanges() {
        // Listen for cart updates from other tabs/windows
        window.addEventListener('storage', (e) => {
            if (e.key === '__cartData') {
                this.loadCart();
                this.emit('cartUpdated', this.getCartData());
            }
        });
    }

    // ==================== CART UI CONTROLS ====================

    openCart() {
        this.emit('cartOpened', this.getCartData());
    }

    closeCart() {
        this.emit('cartClosed', this.getCartData());
    }

    // ==================== CONFIGURATION ====================

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.saveCart();
        this.emit('cartUpdated', this.getCartData());
    }

    getConfig() {
        return { ...this.config };
    }

    // ==================== EXPORT FOR API ====================

    exportForAPI() {
        return {
            items: this.items.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity
            })),
            summary: {
                subtotal: this.getSubtotal(),
                tax: this.getTax(),
                shipping: this.getShipping(),
                discount: this.getDiscount(),
                total: this.getTotal()
            },
            coupon: this.appliedCoupon,
            itemCount: this.getItemCount()
        };
    }
}

// ==================== EXPORT ====================

// Create singleton instance with default config
const cart = ShoppingCart.getInstance({
    includeTax: true,
    taxRate: 0.1,
    includeShipping: true,
    shippingFeePerItem: 1500,
    currency: '₦',
    coupons: {
        "SAVE10": 10,
        "SAVE20": 20,
        "SAVE30": 30,
        "WELCOME15": 15,
        "FREESHIP": { type: 'free_shipping' }
    }
});

// Make available globally
if (typeof window !== 'undefined') {
    window.cart = cart;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = cart;
}

/* 
==================== USAGE EXAMPLES ====================

// 1. ADD TO CART
cart.addItem({
  id: '123',
  name: 'Wireless Headphones',
  price: 15000,
  quantity: 1,
  image: '/images/headphones.jpg',
  category: 'Electronics'
});

// 2. LISTEN TO EVENTS
cart.on('cartUpdated', (data) => {
  console.log('Cart updated:', data.total);
  document.getElementById('cart-count').textContent = data.itemCount;
  document.getElementById('cart-total').textContent = data.total.toFixed(2);
});

cart.on('itemAdded', (data) => {
  showNotification(`${data.product.name} added to cart!`);
});

cart.on('couponApplied', (data) => {
  showNotification(data.message);
});

// 3. QUANTITY MANAGEMENT
cart.incrementItem('123'); // Add 1
cart.decrementItem('123'); // Remove 1
cart.updateQuantity('123', 5); // Set to 5

// 4. APPLY COUPONS
const result = cart.applyCoupon('SAVE20');
if (result.success) {
  console.log(result.message); // "Coupon applied! 20% off"
}

cart.applyCoupon('FREESHIP'); // Free shipping
cart.removeCoupon(); // Remove coupon

// 5. GET CART SUMMARY (for order page)
const summary = cart.getCartSummary();
console.log(summary);
// {
//   items: [...],
//   subtotal: 15000,
//   subtotalFormatted: "₦15000.00",
//   tax: 1500,
//   shipping: 1500,
//   discount: 3000,
//   total: 15000,
//   totalFormatted: "₦15000.00",
//   itemCount: 1,
//   isEmpty: false
// }

// 6. CHECK CART STATUS
if (cart.isCartEmpty()) {
  console.log('Cart is empty');
}

if (cart.isInCart('123')) {
  console.log('Item already in cart');
}

// 7. EXPORT FOR API
const orderData = cart.exportForAPI();
fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData)
});

// 8. OPEN/CLOSE CART UI
document.getElementById('cart-icon').addEventListener('click', () => {
  cart.openCart();
});

cart.on('cartOpened', (data) => {
  document.getElementById('cart-sidebar').classList.add('open');
  renderCartItems(data.items);
});

cart.on('cartClosed', () => {
  document.getElementById('cart-sidebar').classList.remove('open');
});

// 9. UPDATE CONFIGURATION
cart.updateConfig({
  taxRate: 0.15, // Change to 15%
  currency: '$',
  shippingFeePerItem: 500
});

// 10. DISPLAY ORDER SUMMARY
function displayOrderSummary() {
  const summary = cart.getCartSummary();
  
  if (summary.isEmpty) {
    return '<p>Your cart is empty</p>';
  }
  
  let html = '<div class="order-summary">';
  
  summary.items.forEach(item => {
    html += `
      <div class="item">
        <img src="${item.image}" alt="${item.name}">
        <h4>${item.name}</h4>
        <p>Qty: ${item.quantity} × ${summary.currency}${item.price}</p>
        <p>${item.lineTotalFormatted}</p>
      </div>
    `;
  });
  
  html += `
    <div class="totals">
      <p>Subtotal: ${summary.subtotalFormatted}</p>
      <p>Tax (${summary.taxPercentage}): ${summary.taxFormatted}</p>
      <p>Shipping: ${summary.shippingFormatted}</p>
      ${summary.discount > 0 ? `<p>Discount: -${summary.discountFormatted}</p>` : ''}
      <h3>Total: ${summary.totalFormatted}</h3>
    </div>
  `;
  
  return html;
}

*/