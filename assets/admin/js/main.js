// Utility for menu/modal open/close, similar to handlePreviewToggle

function handleMenuToggle(openBtn, menu, closeSelector = '.close-btn', activeClass = 'active', overlay = null) {
    const closeBtn = menu.querySelector(closeSelector);

    openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        hideAllMenus(activeClass);
        menu.classList.add(activeClass);
        if (overlay) overlay.classList.add('active');
        document.body.classList.add('modal-available');
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            menu.classList.remove(activeClass);
            if (overlay) overlay.classList.remove('active');
            document.body.classList.remove('modal-available');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', (e) => {
            menu.classList.remove(activeClass);
            overlay.classList.remove('active');
            document.body.classList.remove('modal-available');
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === 'Esc') {
            menu.classList.remove(activeClass);
            if (overlay) overlay.classList.remove('active');
            document.body.classList.remove('modal-available');
        }
    });
}

function hideAllMenus(activeClass = 'active') {
    // Check if any menu is still active before removing overlay
    const menus = document.querySelectorAll('.search-modal, .smallScreen-sidebar, .dropdown-menu.active');
    menus.forEach(menu => {
        menu.classList.remove(activeClass);
    });

    document.body.classList.remove('modal-available');
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// Wire up search modal using the utility
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('overlay');

    // Handle clicks outside menus
    document.addEventListener('click', (e) => {
        // Check if click was outside all menus and overlay is visible
        if (overlay?.classList.contains('active')) {
            const clickedOnMenu = e.target.closest('.search-modal, .smallScreen-sidebar, .dropdown-menu');
            const clickedOnToggle = e.target.closest('.search-toggle, .sidenav-toggle-button, .dropdown-toggle');
            if (!clickedOnMenu && !clickedOnToggle) {
                hideAllMenus();
            }
        }
    });

    const searchModal = document.querySelector('.search-modal');
    const searchToggle = document.querySelectorAll('.search-toggle');

    searchToggle.forEach(toggle => {
        if (searchModal && toggle) {
            handleMenuToggle(toggle, searchModal, 'button[aria-label="Close"]', 'active', overlay);
        }
    })

    // Sidebar Toggle Logic
    const sidenavToggleButton = document.querySelector(".sidenav-toggle-button");
    const sidebar = document.querySelector(".sidebar");
    const layout = document.querySelector(".layout");
    const smallScreenSidebar = document.querySelector(".smallScreen-sidebar");


    if (sidebar && sidenavToggleButton) {
        const handleResize = () => {
            // Reset classes when switching breakpoints
            if (window.innerWidth >= 1200) {
                smallScreenSidebar.classList.remove('active');
                overlay.classList.remove('active');
            } else {
                sidebar.classList.remove('hoverState');
                layout.classList.remove('sidebarReduced');
            }
        };

        // Handle resize events
        window.addEventListener('resize', handleResize);

        // Universal click handler for both desktop and mobile
        sidenavToggleButton.addEventListener("click", () => {
            if (window.innerWidth >= 1200) {
                // Desktop behavior - resize sidebar
                sidebar.classList.toggle("hoverState");
                layout.classList.toggle("sidebarReduced");
            } else {
                // Mobile behavior - toggle small screen sidebar
                hideAllMenus('active');
                smallScreenSidebar.classList.add('active');
                overlay.classList.add('active');
                document.body.classList.add('modal-available');
            }
        });

        // Add close button handler for mobile view
        const closeBtn = smallScreenSidebar.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                smallScreenSidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.classList.remove('modal-available');
            });
        }

        // Add overlay click handler for mobile view
        overlay.addEventListener('click', () => {
            smallScreenSidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.classList.remove('modal-available');
        });
    }
});

// --- Theme manager (light/dark) ---
const ThemeManager = (() => {
    const KEY = 'theme'; // stored values: 'light'|'dark'
    function get() {
        return localStorage.getItem(KEY) || null;
    }
    function apply(theme) {
        if (!theme) return;
        // apply to root as used by CSS: data-bs-theme
        document.documentElement.setAttribute('data-bs-theme', theme);
        // swap icons inside .mode-btn (expects two svgs inside)
        const modeBtns = document.querySelectorAll('.mode-btn');
        if (modeBtns) {

            modeBtns.forEach(modeBtn => {
                modeBtn.querySelectorAll('svg').forEach(svg => svg.style.display = 'none');
                if (theme === 'dark') {
                    const darkIcon = modeBtn.querySelector('.dark-mode-icon');
                    if (darkIcon) darkIcon.style.display = '';
                } else {
                    const lightIcon = modeBtn.querySelector('.light-mode-icon');
                    if (lightIcon) lightIcon.style.display = '';
                }
            });
        }
    }
    function set(theme) {
        localStorage.setItem(KEY, theme);
        apply(theme);
    }
    function toggle() {
        const current = document.documentElement.getAttribute('data-bs-theme') || get() || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        set(next);
    }
    function init() {
        const stored = get();
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = stored || (prefersDark ? 'dark' : 'light');
        apply(theme);
        // wire button
        const modeBtns = document.querySelectorAll('.mode-btn');
        if (modeBtns) {
            modeBtns.forEach(modeBtn => {
                modeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggle();
                });
            })
        }
    }
    return { init, set, get, toggle };
})();

// initialize theme on load
document.addEventListener('DOMContentLoaded', () => ThemeManager.init());

// Handle dropdowns with outside click detection and single active dropdown
function initializeDropdowns() {
    const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

    // Close all dropdowns
    function closeAllDropdowns() {
        document.querySelectorAll(".dropdown-menu").forEach(menu => {
            menu.classList.remove("active");
        });
    }

    // Handle outside clicks
    document.addEventListener("click", (e) => {
        const isDropdownClick = e.target.closest('.dropdown');
        if (!isDropdownClick) {
            closeAllDropdowns();
        }
    });

    // Setup each dropdown
    dropdownToggles.forEach(toggle => {
        const dropdownMenu = toggle.nextElementSibling;

        toggle.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent document click from immediately closing

            const isActive = dropdownMenu.classList.contains("active");

            // Close all dropdowns first
            closeAllDropdowns();

            // Toggle this dropdown if it wasn't active
            if (!isActive) {
                dropdownMenu.classList.add("active");
            }
        });
    });

    // Add Escape key support
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeAllDropdowns();
        }
    });
}

// Initialize dropdowns when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    initializeDropdowns();

    // Language menu selection logic
    const languageMenu = document.querySelector('.language-menu');
    const languageItems = languageMenu ? languageMenu.querySelectorAll('.language-item') : [];
    const selectedLanguageImg = document.querySelector('.selected-language img');

    languageItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            // Remove active from all
            languageItems.forEach(i => i.classList.remove('active'));
            // Add active to clicked
            item.classList.add('active');
            // Update trigger image
            if (selectedLanguageImg) {
                const img = item.querySelector('img');
                if (img) {
                    selectedLanguageImg.src = img.src;
                    selectedLanguageImg.alt = img.alt;
                }
            }
            // Close dropdown
            const menu = item.closest('.dropdown-menu');
            if (menu) menu.classList.remove('active');
        });
    });
});


// sidebar-dropdown
const sidebarDropdowns = document.querySelectorAll(".sidebar-dropdown");

sidebarDropdowns.forEach(dropdownCon => {
    if (!dropdownCon) return;

    const dropdownToggle = dropdownCon.querySelector(".sidebar-header");
    if (!dropdownToggle) return;

    const dropdownIcon = dropdownToggle.querySelector(".sidebar-header-icon");
    const sidebarDropdownMenu = dropdownToggle.nextElementSibling;

    // Toggle behavior when header is clicked
    dropdownToggle.addEventListener("click", (e) => {
        e.preventDefault();
        if (!sidebarDropdownMenu) return;
        sidebarDropdownMenu.classList.toggle("active");
        if (dropdownIcon) dropdownIcon.classList.toggle("rotated");
    });

    // If menu is initially active, ensure icon reflects that
    if (sidebarDropdownMenu && sidebarDropdownMenu.classList.contains("active")) {
        if (dropdownIcon) dropdownIcon.classList.add("rotated");
    }

    // Wire up sidebar item clicks and check for any pre-set active item
    if (sidebarDropdownMenu) {
        const sidebarLinks = sidebarDropdownMenu.querySelectorAll(".sidebar-item");

        // Add click handlers for each link (if desired behavior is to toggle active on click)
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (ev) => {
                // Optionally prevent default navigation when using SPA; otherwise remove
                // ev.preventDefault();

                // Manage active classes: single active per dropdown
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Ensure parent dropdown remains open when a child is active
                sidebarDropdownMenu.classList.add('active');
                if (dropdownIcon) dropdownIcon.classList.add('rotated');
            });
        });

        // If any child link is pre-marked active on load, open the dropdown
        const anyActive = Array.from(sidebarLinks).some(l => l.classList.contains('active'));
        if (anyActive) {
            sidebarDropdownMenu.classList.add('active');
            if (dropdownIcon) dropdownIcon.classList.add('rotated');
        }
    }
});