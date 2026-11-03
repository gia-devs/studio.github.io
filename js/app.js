// Punto de entrada: rutas, navegación y atajos.

import { route, startRouter } from './core/router.js';
import { store, toggleFavorite } from './core/store.js';
import { initNav } from './components/nav.js';
import { toast } from './components/toast.js';
import { syncFavButtons } from './components/figureCard.js';
import { openSearch } from './components/search.js';
import { getFigure } from './data/figures.js';

route('/home', () => import('./views/home.js'));
route('/inicio', () => import('./views/home.js')); // Alias para enlaces guardados con la ruta anterior.
route('/filosofos', () => import('./views/figures.js'));
route('/artistas', () => import('./views/figures.js'));
route('/figura/:id', () => import('./views/figure.js'));
route('/asistente', () => import('./views/asistente.js'));
route('/comunidad', () => import('./views/asistente.js')); // Alias para enlaces guardados con la ruta anterior.
route('/perfil', () => import('./views/account.js'));

function applySettings() {
  document.documentElement.classList.toggle('reduce-motion', !!store.get().settings.reduceMotion);
}
applySettings();
store.subscribe(applySettings);

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-fav]');
  if (!btn) return;
  e.preventDefault();
  const id = btn.dataset.fav;
  const figure = getFigure(id);
  if (!figure) return;
  const on = toggleFavorite(id);
  syncFavButtons(document, id, on);
  toast(on ? `Añadida a favoritos: ${figure.name}` : `Quitada de favoritos: ${figure.name}`);
  document.dispatchEvent(new CustomEvent('favchange', { detail: { id, on } }));
});

document.addEventListener('keydown', (e) => {
  if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
  const t = e.target;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.isContentEditable) return;
  if (window.innerWidth < 900 || document.querySelector('.modal')) return;
  e.preventDefault();
  openSearch();
});

initNav();
startRouter();
