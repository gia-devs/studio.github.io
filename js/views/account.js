(function (GIA) {
GIA.views = GIA.views || {};
GIA.views.account = GIA.views.account || {};
// Perfil: favoritos, valoraciones, ajustes y acceso local.

const { esc, createScope, initials } = GIA.core.utils;
const { store } = GIA.core.store;
const { navigate, setQuery } = GIA.core.router;
const { getFigure } = GIA.data.figures;
const { figureCard } = GIA.components.figureCard;
const { emptyState } = GIA.components.states;
const { icon } = GIA.components.icons;
const { toast } = GIA.components.toast;
const { confirmDialog } = GIA.components.modal;

const TABS = [
  { id: 'favoritos', label: 'Favoritos' },
  { id: 'valoraciones', label: 'Mis valoraciones' },
  { id: 'resenas', label: 'Mis reseñas' },
  { id: 'ajustes', label: 'Ajustes' },
  { id: 'acceso', label: 'Acceso' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function favoritesPanel() {
  const favs = store.get().favorites.map(getFigure).filter(Boolean);
  if (!favs.length) {
    return emptyState({
      title: 'Aún no tienes favoritos',
      text: 'Toca el corazón en cualquier figura para guardarla aquí.',
      icon: 'heart',
      action: { label: 'Explorar filósofos', href: '#/filosofos' },
      action2: { label: 'Explorar artistas', href: '#/artistas', variant: 'secondary' },
    });
  }
  return `<div class="grid-movies">${favs.map(figureCard).join('')}</div>`;
}

function ratingsPanel() {
  const ratings = store.get().ratings || {};
  const rated = Object.entries(ratings).map(([id, stars]) => ({ figure: getFigure(id), stars })).filter((x) => x.figure);
  if (!rated.length) {
    return emptyState({
      title: 'Aún no valoraste figuras',
      text: 'Abre cualquier ficha y elige de una a cinco estrellas.',
      icon: 'star',
      action: { label: 'Explorar filósofos', href: '#/filosofos' },
      action2: { label: 'Explorar artistas', href: '#/artistas', variant: 'secondary' },
    });
  }
  return `<ul class="my-ratings">${rated.map(({ figure, stars }) =>
    `<li><a href="#/figura/${figure.id}">${esc(figure.name)}</a><span class="community-stars" aria-label="${stars} de 5 estrellas">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</span></li>`
  ).join('')}</ul>`;
}

function reviewsPanel() {
  const reviews = [...(store.get().reviews || [])].reverse();
  if (!reviews.length) {
    return emptyState({
      title: 'Aún no tienes reseñas',
      text: 'Las reseñas que escribas desde una ficha aparecerán aquí.',
      icon: 'chat',
      action: { label: 'Explorar filósofos', href: '#/filosofos' },
      action2: { label: 'Explorar artistas', href: '#/artistas', variant: 'secondary' },
    });
  }
  return `<div class="my-reviews">${reviews.map((review) => {
    const figure = getFigure(review.figureId);
    if (!figure) return '';
    return `<article class="my-review">
      <header><a href="#/figura/${figure.id}">${esc(figure.name)}</a><span class="community-stars" aria-label="${review.stars} de 5 estrellas">${'★'.repeat(review.stars)}${'☆'.repeat(5 - review.stars)}</span></header>
      <p>${esc(review.text)}</p>
      <footer><small>${esc(review.date || '')}</small><a href="#/figura/${figure.id}">Ver ficha</a></footer>
    </article>`;
  }).join('')}</div>`;
}

function settingsPanel() {
  const s = store.get();
  return `<form class="settings" data-settings>
    <label class="switch"><span><strong>Reducir animaciones</strong><br><small class="muted">Desactiva transiciones y el avance automático del carrusel.</small></span><input type="checkbox" name="motion" ${s.settings.reduceMotion ? 'checked' : ''}></label>
    <div class="settings__danger">
      <h3>Datos de este navegador</h3>
      <p class="muted">Borra favoritos, valoraciones, reseñas y ajustes de este navegador. No se puede deshacer.</p>
      <button class="btn btn--danger" type="button" data-wipe>${icon('trash', { size: 17 })} Borrar todos mis datos</button>
    </div>
    <div class="settings__backup">
      <h3>Tu biblioteca</h3>
      <p class="muted">Guarda una copia de tus favoritos, valoraciones, reseñas y ajustes, o restaura una copia anterior.</p>
      <div class="settings__backup-actions">
        <button class="btn btn--secondary" type="button" data-export>Descargar copia</button>
        <label class="btn btn--secondary" for="import-backup">Restaurar copia</label>
        <input id="import-backup" class="sr-only" type="file" accept="application/json,.json" data-import>
      </div>
    </div>
  </form>`;
}

function accessPanel() {
  const { user } = store.get();
  if (user) {
    return `
      <div class="me">
        <span class="me__avatar" aria-hidden="true">${esc(initials(user.name))}</span>
        <div>
          <h3>${esc(user.name)}</h3>
          <p class="muted">${esc(user.email)}</p>
        </div>
        <button class="btn btn--secondary" type="button" data-logout>${icon('logout', { size: 17 })} Salir</button>
      </div>
      <p class="muted me__note">Cuenta de maqueta: solo existe en este navegador.</p>`;
  }
  return `
    <form class="login" data-login novalidate>
      <div class="alert alert--info" role="note">${icon('info', { size: 18 })}<span>Acceso de maqueta: no pedimos contraseña ni enviamos nada a ningún servidor.</span></div>
      <label class="field">
        <span class="field__label">Nombre</span>
        <input class="input" name="name" autocomplete="off" placeholder="Tu nombre" aria-describedby="e-name">
        <span class="field__error" id="e-name" role="alert"></span>
      </label>
      <label class="field">
        <span class="field__label">Correo</span>
        <input class="input" name="email" type="email" autocomplete="off" placeholder="tu@correo.com" aria-describedby="e-email">
        <span class="field__error" id="e-email" role="alert"></span>
      </label>
      <button class="btn btn--primary btn--lg" type="submit">Entrar</button>
    </form>`;
}

const PANELS = { favoritos: favoritesPanel, valoraciones: ratingsPanel, resenas: reviewsPanel, ajustes: settingsPanel, acceso: accessPanel };

GIA.views.account = {
  title: 'Perfil',

  render({ query }) {
    const tab = TABS.some((t) => t.id === query.tab) ? query.tab : 'favoritos';
    const { user } = store.get();
    return `
      <div class="page page--narrow account">
        <header class="page-head">
          <p class="eyebrow">Tu espacio</p>
          <h1>${user ? `Hola, ${esc(user.name.split(' ')[0])}` : 'Perfil'}</h1>
        </header>

        <div class="tabs" role="tablist" aria-label="Secciones del perfil">
          ${TABS.map((t) => `<button class="tab" role="tab" type="button" id="atab-${t.id}" data-tab="${t.id}"
            aria-selected="${t.id === tab}" aria-controls="account-panel" tabindex="${t.id === tab ? 0 : -1}">${t.label}</button>`).join('')}
        </div>

        <div class="account__panel" id="account-panel" role="tabpanel" aria-labelledby="atab-${tab}" data-panel>${PANELS[tab]()}</div>
      </div>`;
  },

  mount(root, { query }) {
    const scope = createScope();
    const panel = root.querySelector('[data-panel]');
    const tabs = [...root.querySelectorAll('[data-tab]')];
    let tab = TABS.some((t) => t.id === query.tab) ? query.tab : 'favoritos';

    function show(id, focus = false) {
      tab = id;
      tabs.forEach((t) => {
        const on = t.dataset.tab === id;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      panel.setAttribute('aria-labelledby', `atab-${id}`);
      panel.innerHTML = PANELS[id]();
      setQuery(id === 'favoritos' ? {} : { tab: id });
    }

    tabs.forEach((t, i) => {
      scope.on(t, 'click', () => show(t.dataset.tab));
      scope.on(t, 'keydown', (e) => {
        const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (step) { e.preventDefault(); show(tabs[(i + step + tabs.length) % tabs.length].dataset.tab, true); }
      });
    });

    scope.on(panel, 'change', (e) => {
      const f = e.target.closest('[data-settings]');
      if (!f || e.target.name !== 'motion') return;
      store.update((s) => { s.settings.reduceMotion = e.target.checked; return s; });
      toast('Ajuste guardado', { type: 'success' });
    });

    scope.on(panel, 'click', async (e) => {
      if (e.target.closest('[data-export]')) {
        const blob = new Blob([store.export()], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gia-studio-copia-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
        toast('Copia descargada', { type: 'success' });
        return;
      }
      if (e.target.closest('[data-logout]')) {
        store.set({ user: null });
        toast('Saliste de tu cuenta');
        navigate('/perfil?tab=acceso', { replace: true });
        return;
      }
      if (e.target.closest('[data-wipe]')) {
        const ok = await confirmDialog({
          title: '¿Borrar todos tus datos?',
          text: 'Se eliminarán favoritos, valoraciones, reseñas y ajustes de este navegador.',
          confirmLabel: 'Borrar todo',
          danger: true,
        });
        if (!ok) return;
        store.reset();
        toast('Datos borrados', { type: 'success' });
        navigate('/perfil', { replace: true });
      }
    });

    scope.on(panel, 'change', async (e) => {
      if (!e.target.matches('[data-import]') || !e.target.files?.[0]) return;
      try {
        store.import(await e.target.files[0].text());
        toast('Copia restaurada', { type: 'success' });
        show(tab);
      } catch (err) {
        toast(err.message || 'No se pudo restaurar la copia', { type: 'error' });
      } finally {
        e.target.value = '';
      }
    });

    scope.on(panel, 'submit', (e) => {
      const form = e.target.closest('[data-login]');
      if (!form) return;
      e.preventDefault();
      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      const set = (id, msg) => {
        form.querySelector(`#e-${id}`).textContent = msg;
        form.elements[id].setAttribute('aria-invalid', msg ? 'true' : 'false');
        return !msg;
      };
      const okName = set('name', name.length >= 2 ? '' : 'Escribe tu nombre.');
      const okMail = set('email', EMAIL_RE.test(email) ? '' : 'Escribe un correo válido.');
      if (!okName) { form.elements.name.focus(); return; }
      if (!okMail) { form.elements.email.focus(); return; }
      store.set({ user: { name, email } });
      toast(`Bienvenido, ${name.split(' ')[0]}`, { type: 'success' });
      navigate('/perfil?tab=acceso', { replace: true });
    });

    scope.on(document, 'favchange', () => { if (tab === 'favoritos') show('favoritos'); });

    return () => scope.cleanup();
  },
};


})(window.GIA = window.GIA || {});
