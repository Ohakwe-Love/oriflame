// Sample orders data
const allOrders = [
    { id: '#ORF-2024-1234', date: 'Dec 5, 2024', items: 3, total: '₦45,000', status: 'processing' },
    { id: '#ORF-2024-1233', date: 'Dec 2, 2024', items: 2, total: '₦32,500', status: 'delivered' },
    { id: '#ORF-2024-1232', date: 'Nov 28, 2024', items: 5, total: '₦67,800', status: 'delivered' },
    { id: '#ORF-2024-1231', date: 'Nov 25, 2024', items: 1, total: '₦15,000', status: 'delivered' },
    { id: '#ORF-2024-1230', date: 'Nov 20, 2024', items: 4, total: '₦54,200', status: 'cancelled' },
    { id: '#ORF-2024-1229', date: 'Nov 15, 2024', items: 2, total: '₦28,000', status: 'delivered' },
    { id: '#ORF-2024-1228', date: 'Nov 10, 2024', items: 3, total: '₦42,500', status: 'pending' },
    { id: '#ORF-2024-1227', date: 'Nov 5, 2024', items: 1, total: '₦18,900', status: 'delivered' },
];

// Switch between sections
function switchSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.user-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.user-nav-item').classList.add('active');

    // Update content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');

    // Load orders if switching to orders section
    if (sectionName === 'orders') {
        loadOrders();
    }

    // Close mobile menu if open
    if (window.innerWidth <= 768) {
        toggleMobileMenu();
    }
}

// Load all orders
function loadOrders() {
    const ordersContent = document.getElementById('ordersContent');

    if (allOrders.length === 0) {
        ordersContent.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">
                            <i class="fas fa-shopping-bag"></i>
                        </div>
                        <h3 class="empty-title">No Orders Yet</h3>
                        <p class="empty-subtitle">You haven't placed any orders. Start shopping to see your orders here.</p>
                        <button class="btn btn-primary" onclick="alert('Redirecting to shop...')">Start Shopping</button>
                    </div>
                `;
    } else {
        ordersContent.innerHTML = `
                    <table class="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Products</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${allOrders.map(order => `
                                <tr>
                                    <td class="order-id">${order.id}</td>
                                    <td>${order.date}</td>
                                    <td>${order.items} items</td>
                                    <td>${order.total}</td>
                                    <td><span class="status-badge ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
                                    <td><button class="btn btn-secondary action-btn" onclick="viewOrder('${order.id}')">View</button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
    }
}

// View order details
function viewOrder(orderId) {
    alert(`Viewing order details for ${orderId}`);
}

// Save profile
function saveProfile(event) {
    event.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;

    // Update user info in sidebar
    document.querySelector('.user-name').textContent = `${firstName} ${lastName}`;
    document.querySelector('.user-avatar').textContent = `${firstName[0]}${lastName[0]}`;

    // Show success message
    const successMsg = document.getElementById('profileSuccess');
    successMsg.classList.add('show');

    setTimeout(() => {
        successMsg.classList.remove('show');
    }, 3000);
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        alert('Logging out... Redirecting to login page.');
        // In a real application, this would redirect to login page
        // window.location.href = '/login';
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.overlay');
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('show');
}

document.querySelector(".user-mobile-menu-btn").addEventListener('click', toggleMobileMenu)

// Initialize orders on page load
loadOrders();