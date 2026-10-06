/* ---------- 1. Sección activa: menú y tono de la luz de fondo ---------- */
const links = [...document.querySelectorAll('header nav a')];
const secciones = document.querySelectorAll('main > section');

const seccionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        document.body.dataset.tono = entry.target.dataset.tono || 'inicio';

        links.forEach(link => {
            const activo = link.getAttribute('href') === '#' + entry.target.id;
            if (activo) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    });
}, { threshold: 0.55 });

secciones.forEach(seccion => seccionObserver.observe(seccion));


/* ---------- 2. Aparición del texto al hacer scroll ---------- */
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);          // solo la primera vez
    });
}, { threshold: 0.25 });

/* Los hijos de cada bloque aparecen escalonados.
   Bloques: el texto de cada sección (article o div) y la última sección (tarjetas). */
document
    .querySelectorAll(
        'main > section:not(:last-child) > article, ' +
        'main > section > div, ' +
        'main > section:last-child'
    )
    .forEach(bloque => {
        [...bloque.children].forEach((hijo, i) => {
            hijo.classList.add('reveal');
            hijo.style.setProperty('--d', i * 120 + 'ms');
            revealObserver.observe(hijo);
        });
    });