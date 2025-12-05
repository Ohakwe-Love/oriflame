(() => {
    let currentSlide = 0;
    const slider = document.getElementById('sliderWrapper');
    const dots = document.getElementById('sliderDots');
    if (!slider) return; // nothing to do

    // Query cards inside slider to keep in-sync with DOM
    let productCards = slider.querySelectorAll('.product-card');

    function getCardsPerView() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1200) return 2;
        return 3;
    }

    function getGap() {
        if (!productCards || productCards.length === 0) return 30;
        const style = window.getComputedStyle(productCards[0]);
        const mr = parseFloat(style.marginRight) || 0;
        return mr || 30;
    }

    let productCardsPerView = getCardsPerView();
    let totalSlides = 1;
    let cardWidth = 0;
    let autoSlide = null;
    let rafId = null;

    function computeLayout() {
        productCards = slider.querySelectorAll('.product-card');
        productCardsPerView = getCardsPerView();
        totalSlides = Math.max(1, Math.ceil(productCards.length / productCardsPerView));
        cardWidth = productCards[0] ? Math.round(productCards[0].getBoundingClientRect().width) : 0;
    }

    function createDots() {
        if (!dots) return;
        dots.innerHTML = '';
        if (totalSlides <= 1) return;
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('span');
            dot.className = `dot ${i === currentSlide ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.onclick = () => goToSlide(i);
            dots.appendChild(dot);
        }
    }

    function updateDots() {
        if (!dots) return;
        const dotNodes = dots.querySelectorAll('.dot');
        dotNodes.forEach((dot, index) => dot.classList.toggle('active', index === currentSlide));
    }

    function updateSlider() {
        if (!slider) return;
        const gap = getGap();
        const offset = currentSlide * (cardWidth + gap) * productCardsPerView;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            slider.style.transform = `translate3d(-${offset}px, 0, 0)`;
            updateDots();
        });
    }

    function moveSlide(direction) {
        if (totalSlides <= 1) return;
        currentSlide += direction;
        if (currentSlide < 0) currentSlide = totalSlides - 1;
        if (currentSlide >= totalSlides) currentSlide = 0;
        updateSlider();
    }

    function goToSlide(index) {
        if (index < 0) index = 0;
        if (index >= totalSlides) index = totalSlides - 1;
        currentSlide = index;
        updateSlider();
    }

    // debounce resize handling
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const oldPerView = productCardsPerView;
            computeLayout();
            if (oldPerView !== productCardsPerView) {
                currentSlide = 0;
                createDots();
            }
            updateSlider();
        }, 120);
    });

    function startAuto() {
        stopAuto();
        autoSlide = setInterval(() => moveSlide(1), 5000);
    }

    function stopAuto() {
        if (autoSlide) {
            clearInterval(autoSlide);
            autoSlide = null;
        }
    }

    // Pause autoplay when tab not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopAuto(); else startAuto();
    });

    // Pause on hover/focus and resume
    slider.addEventListener('mouseenter', stopAuto);
    slider.addEventListener('mouseleave', startAuto);

    // Navigation buttons (if present)
    const sliderNextBtn = document.querySelector('.featured-bestsellers-slider-nav.next');
    const sliderPrevBtn = document.querySelector('.featured-bestsellers-slider-nav.prev');
    if (sliderNextBtn) sliderNextBtn.addEventListener('click', () => moveSlide(1));
    if (sliderPrevBtn) sliderPrevBtn.addEventListener('click', () => moveSlide(-1));

    // Keyboard navigation for accessibility
    slider.tabIndex = slider.tabIndex || 0;
    slider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') moveSlide(-1);
        if (e.key === 'ArrowRight') moveSlide(1);
    });

    // Basic touch support (swipe)
    let touchStartX = 0;
    slider.addEventListener('touchstart', (e) => {
        stopAuto();
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    slider.addEventListener('touchend', (e) => {
        const dx = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX - touchStartX : 0;
        if (Math.abs(dx) > 40) moveSlide(dx > 0 ? -1 : 1);
        startAuto();
    });

    // Initialize
    computeLayout();
    createDots();
    updateSlider();
    startAuto();

})();