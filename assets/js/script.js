let currentSlide = 0;
const slider = document.getElementById('sliderWrapper');
const dots = document.getElementById('sliderDots');
const productCards = document.querySelectorAll('.product-card');

let productCardsPerView = 3;
if (window.innerWidth <= 1200) productCardsPerView = 2;
if (window.innerWidth <= 768) productCardsPerView = 1;

let totalSlides = Math.ceil(productCards.length / productCardsPerView);

function createDots() {
    dots.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = `dot ${i === 0 ? 'active' : ''}`;
        dot.onclick = () => goToSlide(i);
        dots.appendChild(dot);
    }
}

function updateDots() {
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function moveSlide(direction) {
    currentSlide += direction;
    if (currentSlide < 0) currentSlide = totalSlides - 1;
    if (currentSlide >= totalSlides) currentSlide = 0;
    updateSlider();
}

function goToSlide(index) {
    currentSlide = index;
    updateSlider();
}

function updateSlider() {
    const cardWidth = productCards[0].offsetWidth;
    const gap = 30;
    const offset = currentSlide * (cardWidth + gap) * productCardsPerView;
    slider.style.transform = `translateX(-${offset}px)`;
    updateDots();
}

window.addEventListener('resize', () => {
    const oldproductCardsPerView = productCardsPerView;
    productCardsPerView = 3;
    if (window.innerWidth <= 1200) productCardsPerView = 2;
    if (window.innerWidth <= 768) productCardsPerView = 1;

    if (oldproductCardsPerView !== productCardsPerView) {
        currentSlide = 0;
        totalSlides = Math.ceil(productCards.length / productCardsPerView);
        createDots();
        updateSlider();
    }
});

createDots();

let autoSlide = setInterval(() => moveSlide(1), 5000);

slider.addEventListener('mouseenter', () => clearInterval(autoSlide));
slider.addEventListener('mouseleave', () => {
    autoSlide = setInterval(() => moveSlide(1), 5000);
});