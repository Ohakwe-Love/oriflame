const shopSidebar = document.getElementById('shopSidebar');
const toggleShopSidebar = document.getElementById('toggleShopSidebar');

if (toggleShopSidebar && shopSidebar) {
    toggleShopSidebar.addEventListener('click', () => {
        shopSidebar.classList.add('active');
        overlay.classList.add('active');
    });
    
    overlay.addEventListener('click', () => {
        shopSidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
}


function filterProducts() {
    const cats = Array.from(document.querySelectorAll('.cat-filter:checked')).map(e => e.value);
    const brands = Array.from(document.querySelectorAll('.brand-filter:checked')).map(e => e.value);
    const sizes = Array.from(document.querySelectorAll('.size-filter:checked')).map(e => e.value);
    const min = parseFloat(document.getElementById('minPrice').value) || 0;
    const max = parseFloat(document.getElementById('maxPrice').value) || Infinity;

    const products = Array.from(document.querySelectorAll('.product-card'));
    let count = 0;

    products.forEach(p => {
        const cat = p.dataset.category;
        const brand = p.dataset.brand;
        const size = p.dataset.size;
        const price = parseFloat(p.dataset.price);

        const match = (!cats.length || cats.includes(cat)) &&
            (!brands.length || brands.includes(brand)) &&
            (!sizes.length || sizes.includes(size)) &&
            price >= min && price <= max;

        p.style.display = match ? 'block' : 'none';
        if (match) count++;
    });

    document.getElementById('count').textContent = count;
}

document.querySelectorAll('input[type="checkbox"], #minPrice, #maxPrice').forEach(el => {
    el.addEventListener('change', filterProducts);
});

document.getElementById('clearBtn').addEventListener('click', () => {
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    filterProducts();
});

document.getElementById('sort').addEventListener('change', (e) => {
    const grid = document.getElementById('grid');
    const products = Array.from(grid.children);

    products.sort((a, b) => {
        const priceA = parseFloat(a.dataset.price);
        const priceB = parseFloat(b.dataset.price);

        if (e.target.value === 'price-low') return priceA - priceB;
        if (e.target.value === 'price-high') return priceB - priceA;
        return 0;
    });

    products.forEach(p => grid.appendChild(p));
});