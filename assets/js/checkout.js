class CheckOut {
    static instance;
    constructor(options = {}) {
        if (CheckOut.instance) return CheckOut.instance;
        this.items = [];
        this.appliedCoupon = null;
        this.config = {
            taxRate: options.taxRate || 0.1,
            includeTax: options.includeTax !== undefined ? options.includeTax : true,
            shippingFeePerItem: options.shippingFeePerItem || 1500,
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
        this.listeners = {
            cartUpdated: [],
            couponApplied: [],
            couponRemoved: []
        };
        this.loadCart();
        CheckOut.instance = this;
    }

    static getInstance(options) {
        if (!CheckOut.instance) {
            CheckOut.instance = new CheckOut(options);
        }
        return CheckOut.instance;
    }

    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
        return this;
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    addItem(product) {
        if (!product.id || !product.name || product.price === undefined) {
            return false;
        }
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += product.quantity || 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: product.quantity || 1,
                image: product.image || null,
                category: product.category || null
            });
        }
        this.saveCart();
        this.emit('cartUpdated', this.getCartData());
        return true;
    }

    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getTax() {
        if (!this.config.includeTax) return 0;
        return this.getSubtotal() * this.config.taxRate;
    }

    getShipping() {
        if (!this.config.includeShipping) return 0;
        if (this.appliedCoupon && this.appliedCoupon.type === 'free_shipping') return 0;
        const totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
        return totalQuantity * this.config.shippingFeePerItem;
    }

    getDiscount() {
        if (!this.appliedCoupon || this.appliedCoupon.type !== 'percentage') return 0;
        return this.getSubtotal() * (this.appliedCoupon.value / 100);
    }

    getTotal() {
        return this.getSubtotal() + this.getTax() + this.getShipping() - this.getDiscount();
    }

    applyCoupon(code) {
        const upperCode = code.trim().toUpperCase();
        const coupon = this.config.coupons[upperCode];
        if (!coupon) {
            return { success: false, message: 'Invalid coupon code' };
        }
        if (typeof coupon === 'number') {
            this.appliedCoupon = { code: upperCode, type: 'percentage', value: coupon };
        } else if (coupon.type === 'free_shipping') {
            this.appliedCoupon = { code: upperCode, type: 'free_shipping', value: 0 };
        }
        this.saveCart();
        const result = {
            success: true,
            message: this.appliedCoupon.type === 'free_shipping'
                ? `Free shipping applied!`
                : `${this.appliedCoupon.value}% discount applied!`,
            coupon: this.appliedCoupon
        };
        this.emit('couponApplied', result);
        this.emit('cartUpdated', this.getCartData());
        return result;
    }

    removeCoupon() {
        this.appliedCoupon = null;
        this.saveCart();
        this.emit('couponRemoved', {});
        this.emit('cartUpdated', this.getCartData());
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
                ...item,
                lineTotal: item.price * item.quantity,
                lineTotalFormatted: `${currency}${(item.price * item.quantity).toLocaleString()}`
            })),
            subtotal,
            subtotalFormatted: `${currency}${subtotal.toLocaleString()}`,
            tax,
            taxFormatted: `${currency}${tax.toLocaleString()}`,
            shipping,
            shippingFormatted: `${currency}${shipping.toLocaleString()}`,
            discount,
            discountFormatted: `${currency}${discount.toLocaleString()}`,
            appliedCoupon: this.appliedCoupon,
            total,
            totalFormatted: `${currency}${total.toLocaleString()}`,
            isEmpty: this.items.length === 0
        };
    }

    getCartData() {
        return {
            items: this.items,
            subtotal: this.getSubtotal(),
            tax: this.getTax(),
            shipping: this.getShipping(),
            discount: this.getDiscount(),
            total: this.getTotal(),
            appliedCoupon: this.appliedCoupon
        };
    }

    clearCart() {
        this.items = [];
        this.appliedCoupon = null;
        this.saveCart();
        this.emit('cartUpdated', this.getCartData());
    }

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
            if (window.__cartData.config) {
                this.config = { ...this.config, ...window.__cartData.config };
            }
        }
    }
}

// Initialize cart
const cart = CheckOut.getInstance({
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

// Add demo products if cart is empty
if (cart.items.length === 0) {
    cart.addItem({
        id: '1',
        name: 'Queen Fashion Long Sleeve Shirt',
        price: 20000,
        quantity: 1,
        image: 'assets/images/products/1.webp',
        category: 'Face'
    });
    cart.addItem({
        id: '2',
        name: 'Face Oil Premium',
        price: 24990,
        quantity: 2,
        image: 'assets/images/products/2.webp',
        category: 'Face'
    });
    cart.addItem({
        id: '3',
        name: 'Body Cream Luxury',
        price: 18990,
        quantity: 1,
        image: 'assets/images/products/3.webp',
        category: 'Body'
    });
}

// Render order items
function renderOrderItems() {
    const summary = cart.getCartSummary();
    const container = document.getElementById('orderItems');

    if (summary.isEmpty) {
        container.innerHTML = `
                    <div class="empty-cart">
                        <h2>Your cart is empty</h2>
                        <p>Add items to your cart to proceed with checkout</p>
                        <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
                    </div>
                `;
        return;
    }

    container.innerHTML = summary.items.map(item => `
                <div class="summary-item">
                    <img src="${item.image || 'placeholder.jpg'}" alt="${item.name}" class="summary-item-image">
                    <div class="summary-item-details">
                        <div class="summary-item-name">${item.name}</div>
                        <div class="summary-item-meta">
                            ${item.category || 'Product'} • Qty: ${item.quantity} × ${cart.config.currency}${item.price.toLocaleString()}
                        </div>
                        <div class="summary-item-price">${item.lineTotalFormatted}</div>
                    </div>
                </div>
            `).join('');
}

// Update order summary totals
function updateSummaryTotals() {
    const summary = cart.getCartSummary();

    document.getElementById('summarySubtotal').textContent = summary.subtotalFormatted;
    document.getElementById('summaryTax').textContent = summary.taxFormatted;
    document.getElementById('summaryShipping').textContent = summary.shippingFormatted;
    document.getElementById('summaryTotal').textContent = summary.totalFormatted;

    const discountRow = document.getElementById('discountRow');
    if (summary.discount > 0) {
        discountRow.style.display = 'flex';
        document.getElementById('summaryDiscount').textContent = `-${summary.discountFormatted}`;
    } else {
        discountRow.style.display = 'none';
    }
}

// Apply coupon
function applyCoupon() {
    const input = document.getElementById('couponCode');
    const code = input.value.trim();

    if (!code) {
        alert('Please enter a coupon code');
        return;
    }

    const result = cart.applyCoupon(code);

    if (result.success) {
        input.value = '';
        document.querySelector('.coupon-form').style.display = 'none';
        document.getElementById('couponApplied').style.display = 'flex';
        document.querySelector('.coupon-applied-text').textContent = result.message;
        updateSummaryTotals();
    } else {
        alert(result.message);
    }
}

// Remove coupon
function removeCoupon() {
    cart.removeCoupon();
    document.querySelector('.coupon-form').style.display = 'flex';
    document.getElementById('couponApplied').style.display = 'none';
    updateSummaryTotals();
}

// Payment method selection
document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', function () {
        document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
        this.classList.add('selected');
        this.querySelector('input[type="radio"]').checked = true;

        // Show/hide card details
        const cardDetails = document.getElementById('cardDetails');
        if (this.querySelector('input').value === 'card') {
            cardDetails.style.display = 'block';
        } else {
            cardDetails.style.display = 'none';
        }
    });
});

// Place order
function placeOrder() {
    const summary = cart.getCartSummary();

    if (summary.isEmpty) {
        alert('Your cart is empty. Please add items before placing an order.');
        return;
    }

    // Get form data
    const firstName = document.querySelector('input[name="firstName"]').value;
    const lastName = document.querySelector('input[name="lastName"]').value;
    const email = document.querySelector('input[name="email"]').value;
    const phone = document.querySelector('input[name="phone"]').value;
    const address = document.querySelector('input[name="address"]').value;
    const city = document.querySelector('input[name="city"]').value;
    const state = document.querySelector('input[name="state"]').value;
    const postalCode = document.querySelector('input[name="postalCode"]').value;
    const country = document.querySelector('select[name="country"]').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !address || !city || !state || !postalCode || !country) {
        alert('Please fill in all required fields');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    // Create order object
    const orderData = {
        customer: {
            firstName,
            lastName,
            email,
            phone
        },
        shipping: {
            address,
            apartment: document.querySelector('input[name="apartment"]').value,
            city,
            state,
            postalCode,
            country
        },
        payment: {
            method: paymentMethod
        },
        items: summary.items,
        totals: {
            subtotal: summary.subtotal,
            tax: summary.tax,
            shipping: summary.shipping,
            discount: summary.discount,
            total: summary.total
        },
        coupon: summary.appliedCoupon,
        orderDate: new Date().toISOString()
    };

    // Log order data (in production, send to server)
    console.log('Order placed:', orderData);

    // Show success message
    alert(`Order placed successfully! 
            
Order Total: ${summary.totalFormatted}
Payment Method: ${paymentMethod.toUpperCase()}

You will receive a confirmation email at ${email}`);

    // Clear cart
    cart.clearCart();

    // Redirect to success page (or home)
    // window.location.href = 'order-confirmation.html';

    // For demo, reload page
    window.location.reload();
}

// Listen to cart updates
cart.on('cartUpdated', () => {
    renderOrderItems();
    updateSummaryTotals();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    renderOrderItems();
    updateSummaryTotals();

    // Show coupon if already applied
    if (cart.appliedCoupon) {
        document.querySelector('.coupon-form').style.display = 'none';
        document.getElementById('couponApplied').style.display = 'flex';
        const message = cart.appliedCoupon.type === 'free_shipping'
            ? 'Free shipping applied!'
            : `${cart.appliedCoupon.value}% discount applied!`;
        document.querySelector('.coupon-applied-text').textContent = message;
    }
});

// Allow Enter key to apply coupon
document.getElementById('couponCode').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        applyCoupon();
    }
});

// Card number formatting
const cardNumberInput = document.querySelector('input[placeholder="1234 5678 9012 3456"]');
if (cardNumberInput) {
    cardNumberInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    });
}

// Expiry date formatting
const expiryInput = document.querySelector('input[placeholder="MM/YY"]');
if (expiryInput) {
    expiryInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    });
}