document.querySelectorAll('.gallery').forEach((gallery) => {
    const stage    = gallery.querySelector('.gallery__stage');
    const slides   = [...gallery.querySelectorAll('.gallery__slide')];
    const thumbs   = [...gallery.querySelectorAll('.gallery__thumb')];
    const articles = [...document.querySelectorAll('article')];

    if (articles.length !== slides.length) {
        console.warn(`Hay ${slides.length} imágenes y ${articles.length} artículos: deben coincidir.`);
    }

    let active = Math.max(0, slides.findIndex((s) => s.classList.contains('is-active')));
    let startX = 0;
    let dragging = false;

    function update(index) {
        active = Math.max(0, Math.min(index, slides.length - 1));

        slides.forEach((el, i) => el.classList.toggle('is-active', i === active));
        thumbs.forEach((el, i) => el.setAttribute('aria-current', i === active));
        articles.forEach((el, i) => el.classList.toggle('active', i === active));
    }

    // Miniaturas
    thumbs.forEach((thumb, i) => thumb.addEventListener('click', () => update(i)));

    // Teclado: solo cuando el foco está dentro de esta galería
    gallery.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); update(active + 1); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); update(active - 1); }
    });

    // Deslizar con mouse o dedo
    stage.addEventListener('pointerdown', (e) => {
        if (e.target.closest('a, button')) return; // no bloquear clics en enlaces o botones
        dragging = true;
        startX = e.clientX;
        stage.setPointerCapture(e.pointerId);
    });

    stage.addEventListener('pointerup', (e) => {
        if (!dragging) return;
        dragging = false;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 55) update(active + (dx < 0 ? 1 : -1));
    });

    stage.addEventListener('pointercancel', () => { dragging = false; });

    update(active);
});