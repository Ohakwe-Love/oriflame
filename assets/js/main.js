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

// cart function
const FREE_SHIPPING_THRESHOLD = 150;

function updateCartTotals() {
    const items = document.querySelectorAll('.cart-menu .cart-menu-item');    
    let totalAmount = 0;
    let totalItems = 0;
    if (items) {
        items.forEach(item => {
            const unitPrice = parseFloat(item.dataset.price);
            const quantity = parseInt(item.querySelector('.cart-menu .qty-value').textContent);
            const itemTotal = unitPrice * quantity;

            // Update item price display
            item.querySelector('.cart-menu .cart-menu-item-price').textContent = `${itemTotal.toFixed(2)}`;

            totalAmount += itemTotal;
            totalItems += quantity;
            
        });

        // Update subtotal

        document.querySelector('.cart-menu .cart-menu-subtotal-amount') ? document.querySelector('.cart-menu .cart-menu-subtotal-amount').textContent = `${totalAmount.toFixed(2)}` : null;
        document.querySelector('.cart-menu .cart-menu-subtotal-count') ? document.querySelector('.cart-menu .cart-menu-subtotal-count').textContent = `(${totalItems} item${totalItems !== 1 ? 's' : ''})` : null;
    }

    // Update progress bar
    const remaining = FREE_SHIPPING_THRESHOLD - totalAmount;
    const progressPercentage = Math.min((totalAmount / FREE_SHIPPING_THRESHOLD) * 100, 100);

    document.querySelector('.cart-menu-progress-fill').style.width = `${progressPercentage}%`;

    if (remaining > 0) {
        document.querySelector('.cart-menu-progress-text').innerHTML =
            `Add <span class="cart-menu-progress-amount">${remaining.toFixed(2)}</span> to cart and get free shipping!`;
    } else {
        document.querySelector('.cart-menu-progress-text').innerHTML =
            `<span class="cart-menu-progress-amount">You qualify for free shipping!</span>`;
    }
}

function toggleCart() {
    const cartMenu = document.querySelector('.cart-menu');
    overlay.classList.toggle('active');
    cartMenu.classList.toggle('active');

    if(cartMenu.classList.contains('active')) document.body.style.overflow = 'hidden';
}

overlay.addEventListener('click', function () {
    const cartMenu = document.querySelector('.cart-menu');
    if (cartMenu.classList.contains('active')) {
        cartMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Close cart when pressing Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // const overlay = document.querySelector('.cart-overlay');
        const cartMenu = document.querySelector('.cart-menu');

        if (overlay.classList.contains('active')) {
            overlay.classList.remove('active');
            cartMenu.classList.remove('active');
        }
    }
});

// Quantity increase/decrease functionality
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('qty-increase') || e.target.closest('.qty-increase')) {
        const btn = e.target.classList.contains('qty-increase') ? e.target : e.target.closest('.qty-increase');
        const qtyValue = btn.parentElement.querySelector('.qty-value');
        const decreaseBtn = btn.parentElement.querySelector('.qty-decrease');

        let quantity = parseInt(qtyValue.textContent);
        quantity++;
        qtyValue.textContent = quantity;

        // Enable decrease button
        decreaseBtn.disabled = false;

        // Update totals
        updateCartTotals();
    }

    if (e.target.classList.contains('qty-decrease') || e.target.closest('.qty-decrease')) {
        const btn = e.target.classList.contains('qty-decrease') ? e.target : e.target.closest('.qty-decrease');
        const qtyValue = btn.parentElement.querySelector('.qty-value');

        let quantity = parseInt(qtyValue.textContent);

        if (quantity > 1) {
            quantity--;
            qtyValue.textContent = quantity;

            // Disable button if quantity is 1
            if (quantity === 1) {
                btn.disabled = true;
            }

            // Update totals
            updateCartTotals();
        }
    }
});

// Remove item functionality
document.querySelectorAll('.cart-menu-item-remove').forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const item = this.closest('.cart-menu-item');

        // Smooth slide out animation
        item.style.transition = 'all 0.5s ease';
        item.style.opacity = '0';
        item.style.transform = 'translateX(100%)';
        item.style.marginBottom = '0';
        item.style.paddingBottom = '0';
        item.style.maxHeight = item.offsetHeight + 'px';

        setTimeout(() => {
            item.style.maxHeight = '0';
        }, 50);

        setTimeout(() => {
            item.remove();
            updateCartTotals();

            // Check if cart is empty
            const remainingItems = document.querySelectorAll('.cart-menu-item');
            if (remainingItems.length === 0) {
                document.querySelector('.cart-menu-items').innerHTML = `
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
            }
        }, 350);
    });
});

const openCartMenu = document.getElementById('openCartMenu').addEventListener("click", toggleCart);

// Initialize totals on page load
updateCartTotals();

// Disable all decrease buttons that are at quantity 1
document.querySelectorAll('.qty-decrease').forEach(btn => {
    const qtyValue = btn.parentElement.querySelector('.qty-value');
    if (parseInt(qtyValue.textContent) === 1) {
        btn.disabled = true;
    }
});