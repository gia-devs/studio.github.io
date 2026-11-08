(function (GIA) {
GIA.components = GIA.components || {};
GIA.components.nav = GIA.components.nav || {};
// Navegación: barra lateral, inferior y superior.

const { $ } = GIA.core.utils;
const { onRoute, getCurrent } = GIA.core.router;
const { icon } = GIA.components.icons;
const { openSearch } = GIA.components.search;
const { getFigure } = GIA.data.figures;

const ITEMS = [
  { id: 'home', label: 'Home', short: 'Home', icon: 'home', href: '#/home', match: ['/home', '/inicio'] },
  { id: 'filosofos', label: 'Filósofos', short: 'Filósofos', icon: 'book', href: '#/filosofos', match: ['/filosofos'] },
  { id: 'artistas', label: 'Artistas', short: 'Artistas', icon: 'palette', href: '#/artistas', match: ['/artistas'] },
  { id: 'escritores', label: 'Escritores', short: 'Escritores', icon: 'quote', href: '#/escritores', match: ['/escritores'] },
  { id: 'asistente', label: 'Aion', short: 'Aion', icon: 'sparkle', href: '#/asistente', match: ['/asistente', '/comunidad'] },
];

const isActive = (item, path) => item.match.some((m) => path === m || path.startsWith(m + '/'));

function renderNav() {
  $('#side-nav').innerHTML = ITEMS.map((i) =>
    `<a class="nav-link" href="${i.href}" data-nav="${i.id}">${icon(i.icon, { size: 20 })}<span>${i.label}</span></a>`).join('');
  $('#bottom-nav').innerHTML = ITEMS.map((i) =>
    `<a class="bottom-link" href="${i.href}" data-nav="${i.id}">${icon(i.icon, { size: 22 })}<span>${i.short}</span></a>`).join('');
}

const SIDEBAR_KEY = 'gia:sidebar-collapsed';

function setSidebarCollapsed(collapsed, persist = true) {
  const app = $('.app');
  const button = $('#sidebar-toggle');
  if (!app || !button) return;
  app.classList.toggle('app--sidebar-collapsed', collapsed);
  button.setAttribute('aria-expanded', String(!collapsed));
  button.setAttribute('aria-label', collapsed ? 'Expandir menú' : 'Contraer menú');
  button.title = collapsed ? 'Expandir menú' : 'Contraer menú';
  button.innerHTML = icon(collapsed ? 'chevronRight' : 'chevronLeft', { size: 18 });
  document.querySelectorAll('.side-nav [data-nav]').forEach((link) => {
    link.title = collapsed ? ITEMS.find((item) => item.id === link.dataset.nav)?.label || '' : '';
  });
  if (persist) {
    try { localStorage.setItem(SIDEBAR_KEY, String(collapsed)); } catch { /* preferencia opcional */ }
  }
}

function setActive(path) {
  const figureId = path.startsWith('/figura/') ? decodeURIComponent(path.slice('/figura/'.length)) : '';
  const figure = figureId ? getFigure(figureId) : null;
  const activeItem = figure ? (figure.type === 'artista' ? 'artistas' : figure.type === 'escritor' ? 'escritores' : 'filosofos') : null;
  document.querySelectorAll('[data-nav]').forEach((a) => {
    const item = ITEMS.find((i) => i.id === a.dataset.nav);
    if (item.id === activeItem || (!activeItem && isActive(item, path))) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

function initNav() {
  renderNav();
  let collapsed = false;
  try { collapsed = window.innerWidth >= 900 && localStorage.getItem(SIDEBAR_KEY) === 'true'; } catch { /* preferencia opcional */ }
  setSidebarCollapsed(collapsed, false);
  $('#sidebar-toggle').addEventListener('click', () => {
    collapsed = !$('.app').classList.contains('app--sidebar-collapsed');
    setSidebarCollapsed(collapsed);
  });
  setActive(getCurrent().path);
  onRoute(({ path }) => setActive(path));

  $('[data-slot="icon"]').innerHTML = icon('search', { size: 19 });

  $('#open-search').addEventListener('click', openSearch);
}


Object.assign(GIA.components.nav, { initNav });
})(window.GIA = window.GIA || {});
