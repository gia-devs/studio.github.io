(function (GIA) {
GIA.views = GIA.views || {};
GIA.views.home = GIA.views.home || {};
// Home: figura destacada y accesos a las secciones.

const { esc, createScope, prefersReducedMotion } = GIA.core.utils;
const { FIGURES, TYPE_LABELS, fmtYears, getFigure } = GIA.data.figures;
const { store } = GIA.core.store;
const { figureCard } = GIA.components.figureCard;
const { emptyState } = GIA.components.states;
const { portrait } = GIA.components.portrait;
const { icon } = GIA.components.icons;

const FEATURED_IDS = ['socrates', 'nietzsche', 'simone-de-beauvoir', 'leonardo', 'frida-kahlo', 'virginia-woolf'];
const featured = () => FEATURED_IDS.map((id) => FIGURES.find((f) => f.id === id)).filter(Boolean);

function slide(f, i) {
  return `
    <article class="hero__slide ${i === 0 ? 'is-active' : ''}" data-slide="${i}" role="group" aria-roledescription="diapositiva"
      aria-label="${i + 1} de ${featured().length}: ${esc(f.name)}" ${i === 0 ? '' : 'aria-hidden="true" inert'}
      style="--c1:${f.c1};--c2:${f.c2}">
      <div class="hero__poster" aria-hidden="true">${portrait(f)}</div>
      <div class="hero__body">
        <p class="eyebrow">${TYPE_LABELS[f.type]} · ${esc(f.period)}</p>
        <h1 class="hero__title">${esc(f.name)}</h1>
        <p class="hero__tagline">${esc(f.epithet)}</p>
        <ul class="hero__meta">
          <li><span class="badge badge--accent">${TYPE_LABELS[f.type]}</span></li>
          <li>${esc(f.disciplines.join(' · '))}</li>
          <li>${esc(fmtYears(f.years))}</li>
          <li class="hero__score">${icon('star', { size: 15 })} ${f.score.toFixed(1)}</li>
        </ul>
        <p class="hero__synopsis">${esc(f.bio.slice(0, 180))}…</p>
        <div class="hero__actions">
          <a class="btn btn--primary btn--lg" href="#/figura/${f.id}">Ver ficha</a>
        </div>
      </div>
    </article>`;
}

function hero() {
  const list = featured();
  return `
    <section class="hero" aria-roledescription="carrusel" aria-label="Figuras destacadas" tabindex="-1">
      <div class="hero__stage" data-stage>${list.map(slide).join('')}</div>
      <div class="hero__controls">
        <div class="hero__dots" role="group" aria-label="Elegir figura destacada">
          ${list.map((f, i) => `<button class="hero__dot ${i === 0 ? 'is-active' : ''}" type="button" data-dot="${i}"
            aria-label="Ir a ${esc(f.name)}" aria-current="${i === 0}"><span></span></button>`).join('')}
        </div>
        <div class="hero__arrows">
          <button class="icon-btn" type="button" data-pause aria-label="Pausar carrusel">${icon('pause', { size: 17 })}</button>
          <button class="icon-btn" type="button" data-prev aria-label="Anterior">${icon('chevronLeft')}</button>
          <button class="icon-btn" type="button" data-next aria-label="Siguiente">${icon('chevronRight')}</button>
        </div>
      </div>
    </section>`;
}

function unitCards() {
  return `
    <section class="unit-cards" aria-label="Explora las secciones">
      <a class="unit-card" href="#/filosofos">
        <span class="unit-card__icon">${icon('book', { size: 26 })}</span>
        <span class="eyebrow">Pensamiento</span>
        <h2>Filósofos</h2>
        <p>Ideas, preguntas y pensadores que cambiaron nuestra forma de ver el mundo.</p>
        <span class="unit-card__more">Explorar filósofos ${icon('arrowRight', { size: 19 })}</span>
      </a>
      <a class="unit-card" href="#/artistas">
        <span class="unit-card__icon">${icon('palette', { size: 26 })}</span>
        <span class="eyebrow">Creación</span>
        <h2>Artistas</h2>
        <p>Obras, miradas y lenguajes que transformaron la cultura.</p>
        <span class="unit-card__more">Explorar artistas ${icon('arrowRight', { size: 19 })}</span>
      </a>
      <a class="unit-card" href="#/escritores">
        <span class="unit-card__icon">${icon('quote', { size: 26 })}</span>
        <span class="eyebrow">Literatura</span>
        <h2>Escritores</h2>
        <p>Novelas, poemas y obras que nos ayudan a mirar el mundo desde otras voces.</p>
        <span class="unit-card__more">Explorar escritores ${icon('arrowRight', { size: 19 })}</span>
      </a>
    </section>`;
}

function favoritesSection() {
  const favorites = store.get().favorites.map(getFigure).filter(Boolean);
  return `<section class="section home-favorites" aria-labelledby="favorites-title">
    <div class="section-head"><div><p class="eyebrow">Tu biblioteca</p><h2 id="favorites-title">Tus favoritos</h2></div></div>
    ${favorites.length ? `<div class="grid-movies">${favorites.map((figure) => figureCard(figure, '/home')).join('')}</div>` : emptyState({
      title: 'Aún no tienes favoritos',
      text: 'Guarda figuras con el corazón y las encontrarás aquí.',
      icon: 'heart',
      action: { label: 'Explorar filósofos', href: '#/filosofos' },
      action2: { label: 'Explorar escritores', href: '#/escritores', variant: 'secondary' },
    })}
  </section>`;
}

function ad() {
  return `<section class="community__intro home-community">
    <p class="eyebrow">Aion · El espacio donde conversas y exploras</p>
    <h2>Una pregunta puede abrir una nueva idea.</h2>
    <p>Aion, el guardián cósmico de la creatividad y el conocimiento, te acompaña a descubrir G’IA.</p>
    <a class="btn btn--primary" href="#/asistente">Conversar con Aion</a>
  </section>`;
}

GIA.views.home = {
  title: 'Home',

  render() {
    return `
      <div class="page home">
        ${hero()}
        ${unitCards()}
        <div data-home-favorites>${favoritesSection()}</div>
        ${ad()}
      </div>`;
  },

  mount(root) {
    const scope = createScope();
    const list = featured();
    scope.on(document, 'favchange', () => { const region = root.querySelector('[data-home-favorites]'); if (region) region.innerHTML = favoritesSection(); });
    const heroEl = root.querySelector('.hero');
    const slides = [...root.querySelectorAll('.hero__slide')];
    const dots = [...root.querySelectorAll('.hero__dot')];
    const pauseBtn = root.querySelector('[data-pause]');
    const INTERVAL = 7000;

    let index = 0;
    let userPaused = prefersReducedMotion();
    let hovering = false;
    let timer = null;

    function go(i) {
      index = (i + list.length) % list.length;
      slides.forEach((s, k) => {
        const on = k === index;
        s.classList.toggle('is-active', on);
        if (on) { s.removeAttribute('aria-hidden'); s.removeAttribute('inert'); }
        else { s.setAttribute('aria-hidden', 'true'); s.setAttribute('inert', ''); }
      });
      dots.forEach((d, k) => {
        d.classList.toggle('is-active', k === index);
        d.setAttribute('aria-current', String(k === index));
        d.classList.remove('is-running');
      });
      restart();
    }

    function stop() { clearTimeout(timer); timer = null; dots.forEach((d) => d.classList.remove('is-running')); }
    function restart() {
      stop();
      if (userPaused || hovering || document.hidden) return;
      void dots[index].offsetWidth;
      dots[index].classList.add('is-running');
      timer = setTimeout(() => go(index + 1), INTERVAL);
    }

    function syncPauseBtn() {
      pauseBtn.innerHTML = icon(userPaused ? 'play' : 'pause', { size: 17 });
      pauseBtn.setAttribute('aria-label', userPaused ? 'Reanudar carrusel' : 'Pausar carrusel');
    }

    scope.on(root.querySelector('[data-next]'), 'click', () => go(index + 1));
    scope.on(root.querySelector('[data-prev]'), 'click', () => go(index - 1));
    dots.forEach((d, k) => scope.on(d, 'click', () => go(k)));
    scope.on(pauseBtn, 'click', () => { userPaused = !userPaused; syncPauseBtn(); restart(); });

    scope.on(heroEl, 'mouseenter', () => { hovering = true; stop(); });
    scope.on(heroEl, 'mouseleave', () => { hovering = false; restart(); });
    scope.on(heroEl, 'focusin', () => { hovering = true; stop(); });
    scope.on(heroEl, 'focusout', () => { hovering = false; restart(); });
    scope.on(document, 'visibilitychange', restart);

    scope.on(heroEl, 'keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
    });

    let x0 = null, y0 = 0;
    scope.on(heroEl, 'touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    scope.on(heroEl, 'touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) go(index + (dx < 0 ? 1 : -1));
      x0 = null;
    }, { passive: true });

    syncPauseBtn();
    restart();
    scope.add(stop);

    return () => scope.cleanup();
  },
};


})(window.GIA = window.GIA || {});
