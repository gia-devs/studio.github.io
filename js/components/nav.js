// Navegación: barra lateral, inferior y superior.

import { $, esc, initials } from '../core/utils.js';
import { store } from '../core/store.js';
import { navigate, onRoute, getCurrent } from '../core/router.js';
import { icon } from './icons.js';
import { openSearch } from './search.js';
import { getFigure } from '../data/figures.js';

const ITEMS = [
  { id: 'home', label: 'Home', short: 'Home', icon: 'home', href: '#/home', match: ['/home', '/inicio'] },
  { id: 'filosofos', label: 'Filósofos', short: 'Filósofos', icon: 'book', href: '#/filosofos', match: ['/filosofos'] },
  { id: 'artistas', label: 'Artistas', short: 'Artistas', icon: 'palette', href: '#/artistas', match: ['/artistas'] },
  { id: 'asistente', label: 'Aion', short: 'Aion', icon: 'sparkle', href: '#/asistente', match: ['/asistente', '/comunidad'] },
  { id: 'perfil', label: 'Perfil', short: 'Perfil', icon: 'user', href: '#/perfil', match: ['/perfil'] },
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
  const activeItem = figure ? (figure.type === 'artista' ? 'artistas' : 'filosofos') : null;
  document.querySelectorAll('[data-nav]').forEach((a) => {
    const item = ITEMS.find((i) => i.id === a.dataset.nav);
    if (item.id === activeItem || (!activeItem && isActive(item, path))) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

function updateAccount() {
  const { user } = store.get();
  const btn = $('#account-btn');
  btn.setAttribute('aria-label', user ? `Mi perfil, ${user.name}` : 'Entrar');
  btn.innerHTML = user
    ? `<span>${esc(initials(user.name))}</span><span class="account-btn__label">${esc(user.name.split(' ')[0])}</span>`
    : `${icon('user', { size: 18 })}<span class="account-btn__label">Entrar</span>`;
}

export function initNav() {
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
  $('#account-btn').addEventListener('click', () =>
    navigate(store.get().user ? '/perfil' : '/perfil?tab=acceso'));

  updateAccount();
  store.subscribe(updateAccount);
}
