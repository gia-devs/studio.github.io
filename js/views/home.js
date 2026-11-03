// Home: figura destacada y accesos a las secciones.

import { esc, createScope, prefersReducedMotion } from '../core/utils.js';
import { FIGURES, TYPE_LABELS, fmtYears } from '../data/figures.js';
import { portrait } from '../components/portrait.js';
import { icon } from '../components/icons.js';

const FEATURED_IDS = ['socrates', 'nietzsche', 'simone-de-beauvoir', 'leonardo', 'frida-kahlo', 'virginia-woolf'];
const featured = () => FEATURED_IDS.map((id) => FIGURES.find((f) => f.id === id)).filter(Boolean);

const EXPLORATION_PATHS = [
  {
    id: 'identidad', title: 'Identidad', intro: 'Tres maneras de pensar cómo se forma la identidad y cómo encontramos una voz propia.',
    steps: [
      { id: 'simone-de-beauvoir', link: 'Analiza cómo la sociedad construye la identidad de las mujeres.' },
      { id: 'frida-kahlo', link: 'Convierte el cuerpo y la experiencia personal en imagen.' },
      { id: 'virginia-woolf', link: 'Reivindica el espacio y la libertad necesarios para escribir.' },
    ],
  },
  {
    id: 'etica', title: 'Ética', intro: 'Del diálogo sobre la virtud a la responsabilidad de pensar y actuar.',
    steps: [
      { id: 'socrates', link: 'Examina la justicia y la virtud haciendo preguntas.' },
      { id: 'confucio', link: 'Relaciona la conducta recta con la virtud y las relaciones humanas.' },
      { id: 'hannah-arendt', link: 'Explora la responsabilidad, el pensamiento y la acción política.' },
    ],
  },
  {
    id: 'mirar-el-mundo', title: 'Mirar el mundo', intro: 'Tres formas de preguntar qué vemos y cómo transformamos esa percepción.',
    steps: [
      { id: 'platon', link: 'Distingue el mundo sensible de las Ideas.' },
      { id: 'leonardo', link: 'Une la observación, el arte y la investigación de la naturaleza.' },
      { id: 'yayoi-kusama', link: 'Explora la percepción, la repetición y el infinito.' },
    ],
  },
];

function renderPath(path) {
  const figures = path.steps.map((step) => ({ ...step, figure: FIGURES.find((f) => f.id === step.id) })).filter((step) => step.figure);
  return `<p class="exploration__intro">${esc(path.intro)}</p><div class="theme-stops">${figures.map(({ figure, link }, i) => `
    <a class="theme-stop" href="#/figura/${figure.id}">
      <span class="theme-stop__number">0${i + 1}</span>
      <span class="eyebrow">${esc(TYPE_LABELS[figure.type])}</span>
      <h3>${esc(figure.name)}</h3>
      <p>${esc(link)}</p>
      <span class="theme-stop__link">Ver ficha ${icon('arrowRight', { size: 17 })}</span>
    </a>`).join('')}</div>`;
}

function explorationPath() {
  const first = EXPLORATION_PATHS[0];
  return `<section class="exploration" aria-labelledby="exploration-title">
    <div class="section-head"><div><p class="eyebrow">Recorridos breves</p><h2 id="exploration-title">Sigue una idea</h2></div></div>
    <div class="exploration__tabs" data-theme-tabs role="group" aria-label="Elegir tema">${EXPLORATION_PATHS.map((path, i) => `<button class="exploration__tab" type="button" data-theme="${path.id}" aria-pressed="${i === 0}">${esc(path.title)}</button>`).join('')}</div>
    <div data-theme-results aria-live="polite">${renderPath(first)}</div>
  </section>`;
}

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

export default {
  title: 'Home',

  render() {
    return `
      <div class="page home">
        ${hero()}
        ${unitCards()}
        ${explorationPath()}
        ${ad()}
      </div>`;
  },

  mount(root) {
    const scope = createScope();
    const list = featured();
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

    const themeTabs = root.querySelector('[data-theme-tabs]');
    const themeResults = root.querySelector('[data-theme-results]');
    scope.on(themeTabs, 'click', (event) => {
      const button = event.target.closest('[data-theme]');
      if (!button) return;
      const path = EXPLORATION_PATHS.find((item) => item.id === button.dataset.theme);
      if (!path) return;
      themeTabs.querySelectorAll('[data-theme]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      themeResults.innerHTML = renderPath(path);
    });

    return () => scope.cleanup();
  },
};
