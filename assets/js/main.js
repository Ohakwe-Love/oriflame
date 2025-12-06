// import cart from "./cart.js";

// const cart = require("./cart");

// modal-overlay
const overlay = document.getElementById("overlay");

// mobile menu
const mobileMenuBtn = document.getElementById('mobileNavBtn');
const cancelMobileMenuBtn = document.getElementById('closeMobileMenu');
const mobileNav = document.getElementById('mobileNav');
const mobileNavOverly = document.getElementById('mobileNavOverlay');

function toggleMobileNav() {
    if (mobileMenuBtn) {
        mobileMenuBtn.classList.toggle('active');

        if (mobileMenuBtn.classList.contains('active')) {
            mobileMenuBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.5859 12L2.79297 4.20706L4.20718 2.79285L12.0001 10.5857L19.793 2.79285L21.2072 4.20706L13.4143 12L21.2072 19.7928L19.793 21.2071L12.0001 13.4142L4.20718 21.2071L2.79297 19.7928L10.5859 12Z"></path></svg>`;
        } else {
            mobileMenuBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4H21V6H3V4ZM3 11H15V13H3V11ZM3 18H21V20H3V18Z"></path></svg>`
        }
    }
    if (mobileNav) mobileNav.classList.toggle('active');
    if (mobileNavOverly) mobileNavOverly.classList.toggle('active');
    if (mobileNav && document.body) document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
}

function closeMobileMenu() {
    if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
    if (mobileNav) mobileNav.classList.remove('active');
    if (mobileNavOverly) mobileNavOverly.classList.remove('active');
    document.body.style.overflow = '';
}

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileNav);
}

if (cancelMobileMenuBtn) {
    cancelMobileMenuBtn.addEventListener('click', toggleMobileNav)
}

if (mobileNavOverly) {
    mobileNavOverly.addEventListener('click', toggleMobileNav);
}

// Close mobile menu when clicking on a link
let mobileLinks = [];
if (mobileNav) {
    mobileLinks = mobileNav.querySelectorAll('a');
    if (mobileLinks) {
        mobileLinks.forEach(link => {
            if (!link) return;
            link.addEventListener('click', () => {
                setTimeout(closeMobileMenu, 150);
            });
        });
    }
}


// Search Modal logic
const openSearchBtns = document.querySelectorAll('.search-btn');
const closeSearchBtn = document.getElementById('closeSearchModal');
const searchModal = document.getElementById('searchModal');
const searchInput = document.getElementById('searchInput');
const clearSearchHistory = document.getElementById("clearSearchHistory");
const searchedItems = document.querySelectorAll(".searchedItem");
const noSearchFound = document.querySelector(".noSearchFound");

function closeAllMenusExceptSearch() {
    document.querySelectorAll('.sidebar, .nav-mobile, .other-modal, .dropdown, .preview')
        .forEach(el => el.classList.remove('active', 'open', 'show', 'preview'));
    document.body.classList.remove('modal-available');
}

function openSearchModal(e) {
    if (e) e.preventDefault();
    closeAllMenusExceptSearch();
    if (searchModal) searchModal.classList.add("active");
    if (overlay) overlay.classList.add('active');
    if (document.body) document.body.style.overflow = 'hidden';
    setTimeout(function () { if (searchInput) searchInput.focus(); }, 100);
}

function closeSearchModal() {
    if (searchModal) searchModal.classList.remove("active");
    if (overlay) overlay.classList.remove('active');
    if (document.body) document.body.style.overflow = '';
}

if (openSearchBtns) {
    openSearchBtns.forEach(function (btn) {
        if (!btn) return;
        btn.addEventListener('click', openSearchModal);
    });
}

if (closeSearchBtn) {
    closeSearchBtn.addEventListener('click', closeSearchModal);
}

if (overlay) {
    overlay.addEventListener('click', closeSearchModal);
}

document.addEventListener('keydown', function (e) {
    if (searchModal && searchModal.classList.contains('active') && e.key === 'Escape') closeSearchModal();
});

// Prevent form submit default
const searchForm = document.getElementById('searchForm');

if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        closeSearchModal();
        alert('Searching for: ' + (searchInput ? searchInput.value : ''));
    });
}

if (!searchedItems) {
    clearSearchHistory.classList.add("disabled");
    noSearchFound.classList.add("active");
} else {
    clearSearchHistory.addEventListener("click", () => {
        searchedItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.transition = 'opacity 0.5s';
                item.style.opacity = '0';
                setTimeout(() => {
                    item.remove();
                    // After the last item is removed, update classes
                    if (index === searchedItems.length - 1) {
                        clearSearchHistory.classList.add("disabled");
                        noSearchFound.classList.add("active");
                    }
                }, 600);
            }, index * 100);
        });
    });
}

function renderCartItems() {
    const summary = cart.getCartSummary();
    const container = document.querySelector('.cart-menu-items');

    if (!container) return; // Exit if cart container doesn't exist on this page

    // Handle empty cart
    if (summary.isEmpty) {
        container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-color);">
        <svg style="width: 80px; height: 80px; margin-bottom: 20px; opacity: 0.3;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <h3 style="font-size: 20px; color: var(--primary-btn); margin-bottom: 8px;">Your cart is empty</h3>
        <p style="font-size: 14px;">Add some products to get started!</p>
      </div>
    `;
        return;
    }

    // Render items
    let html = '';
    summary.items.forEach(item => {
        html += `
      <div class="cart-menu-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" loading="lazy" class="cart-menu-item-image">
        <div class="cart-menu-item-details">
          <div class="cart-menu-item-category">${item.category || 'Product'}</div>
          <h4 class="cart-menu-item-name">${item.name}</h4>
          <div class="cart-menu-item-meta">
            <span>Price: <span>$${item.price.toFixed(2)}</span></span>
          </div>
          <div class="cart-menu-item-footer">
            <div class="cart-menu-item-quantity">
              <button class="qty-btn qty-decrease" data-id="${item.id}" aria-label="Decrease quantity">−</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn qty-increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
            </div>
            <span class="cart-menu-item-price">${item.lineTotalFormatted}</span>
          </div>
        </div>
        <button class="cart-menu-item-remove" data-id="${item.id}" aria-label="Remove item">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8ZM6 10V20H18V10H6ZM9 12H11V18H9V12ZM13 12H15V18H13V12ZM7 5V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V5H22V7H2V5H7ZM9 4V5H15V4H9Z"></path>
          </svg>
        </button>
      </div>
    `;
    });

    container.innerHTML = html;
}

// ==================== UPDATE CART TOTALS ====================
function updateCartTotals() {
    const summary = cart.getCartSummary();
    const FREE_SHIPPING_THRESHOLD = 150;

    // Update subtotal amount
    const subtotalEl = document.querySelector('.cart-menu-subtotal-amount');
    if (subtotalEl) {
        subtotalEl.textContent = summary.subtotalFormatted;
    }

    // Update item count
    const countEl = document.querySelector('.cart-menu-subtotal-count');
    if (countEl) {
        countEl.textContent = `(${summary.itemCount} item${summary.itemCount !== 1 ? 's' : ''})`;
    }

    // Update cart badge (if you have one in header)
    const badgeEl = document.querySelector('.cart-badge');
    if (badgeEl) {
        badgeEl.textContent = summary.itemCount;
        badgeEl.style.display = summary.itemCount > 0 ? 'flex' : 'none';
    }

    // Update free shipping progress
    const progressBar = document.querySelector('.cart-menu-progress-fill');
    const progressText = document.querySelector('.cart-menu-progress-text');

    if (progressBar && progressText) {
        const remaining = FREE_SHIPPING_THRESHOLD - summary.subtotal;
        const percentage = Math.min((summary.subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

        progressBar.style.width = `${percentage}%`;

        if (remaining > 0) {
            progressText.innerHTML =
                `Add <span class="cart-menu-progress-amount">$${remaining.toFixed(2)}</span> to cart and get free shipping!`;
        } else {
            progressText.innerHTML =
                `<span class="cart-menu-progress-amount">You qualify for free shipping!</span>`;
        }
    }
}

// ==================== ADD TO CART BUTTONS ====================
document.addEventListener('click', (e) => {
    // Handle "Add to Cart" button clicks
    if (e.target.classList.contains('add-to-cart-btn') || e.target.closest('.add-to-cart-btn')) {
        e.preventDefault();

        const btn = e.target.classList.contains('add-to-cart-btn')
            ? e.target
            : e.target.closest('.add-to-cart-btn');

        const product = {
            id: btn.dataset.productId,
            name: btn.dataset.productName,
            price: parseFloat(btn.dataset.price),
            quantity: 1,
            image: btn.dataset.image,
            category: btn.dataset.category || 'Product'
        };

        cart.addItem(product);

        setTimeout(()=> {
            btn.textContent = "Added";
        }, 500)

        // Show success message (optional - customize as needed)
        // alert(`${product.name} added to cart!`);

        // Optional: Open cart
        // cart.openCart();
    }
});

// ==================== QUANTITY & REMOVE BUTTONS ====================
document.addEventListener('click', (e) => {
    // Increase quantity
    if (e.target.classList.contains('qty-increase')) {
        const productId = e.target.dataset.id;
        cart.incrementItem(productId);
    }

    // Decrease quantity
    if (e.target.classList.contains('qty-decrease')) {
        const productId = e.target.dataset.id;
        cart.decrementItem(productId);
    }

    // Remove item
    if (e.target.closest('.cart-menu-item-remove')) {
        const btn = e.target.closest('.cart-menu-item-remove');
        const productId = btn.dataset.id;

        // Add animation (keeping your existing smooth animation)
        const item = btn.closest('.cart-menu-item');
        item.style.transition = 'all 0.3s ease';
        item.style.opacity = '0';
        item.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            cart.removeItem(productId);
        }, 300);
    }
});

// ==================== OPEN/CLOSE CART ====================
function toggleCart() {
    const cartMenu = document.querySelector('.cart-menu');
    const overlay = document.querySelector('.overlay');

    if (cartMenu.classList.contains('active')) {
        cart.closeCart();
    } else {
        cart.openCart();
    }
}

// Cart open button
const openCartBtn = document.getElementById('openCartMenu');
if (openCartBtn) {
    openCartBtn.addEventListener('click', toggleCart);
}

// Cart close button
const closeCartBtn = document.querySelector('.cart-menu-close');
if (closeCartBtn) {
    closeCartBtn.addEventListener('click', () => cart.closeCart());
}

// Listen for cart open event
cart.on('cartOpened', () => {
    const cartMenu = document.querySelector('.cart-menu');
    const overlay = document.querySelector('.overlay');

    if (cartMenu) cartMenu.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// Listen for cart close event
cart.on('cartClosed', () => {
    const cartMenu = document.querySelector('.cart-menu');
    const overlay = document.querySelector('.overlay');

    if (cartMenu) cartMenu.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
});

// Close cart when clicking overlay
if (overlay) {
    overlay.addEventListener('click', () => {
        const cartMenu = document.querySelector('.cart-menu');
        if (cartMenu && cartMenu.classList.contains('active')) {
            cart.closeCart();
        }
    });
}

// Close cart when pressing Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const cartMenu = document.querySelector('.cart-menu');
        if (cartMenu && cartMenu.classList.contains('active')) {
            cart.closeCart();
        }
    }
});

// ==================== CLEAR CART BUTTON ====================
const clearCartBtn = document.querySelector('.cart-menu-buttons .btn-secondary');
if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your cart?')) {
            cart.clearCart();
        }
    });
}

// ==================== CART UPDATE LISTENER ====================
cart.on('cartUpdated', () => {
    renderCartItems();
    updateCartTotals();
});

// ==================== INITIALIZE ON PAGE LOAD ====================
document.addEventListener('DOMContentLoaded', () => {
    renderCartItems();
    updateCartTotals();
});