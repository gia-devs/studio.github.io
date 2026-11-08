(function (GIA) {

// Punto de entrada: rutas, navegación y atajos.

const { route, startRouter } = GIA.core.router;
const { toggleFavorite } = GIA.core.store;
const { initNav } = GIA.components.nav;
const { toast } = GIA.components.toast;
const { syncFavButtons } = GIA.components.figureCard;
const { openSearch } = GIA.components.search;
const { getFigure } = GIA.data.figures;

route('/home', () => Promise.resolve({ default: GIA.views.home }));
route('/inicio', () => Promise.resolve({ default: GIA.views.home })); // Alias para enlaces guardados con la ruta anterior.
route('/filosofos', () => Promise.resolve({ default: GIA.views.figures }));
route('/artistas', () => Promise.resolve({ default: GIA.views.figures }));
route('/escritores', () => Promise.resolve({ default: GIA.views.figures }));
route('/figura/:id', () => Promise.resolve({ default: GIA.views.figure }));
route('/asistente', () => Promise.resolve({ default: GIA.views.asistente }));
route('/comunidad', () => Promise.resolve({ default: GIA.views.asistente })); // Alias para enlaces guardados con la ruta anterior.

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


})(window.GIA = window.GIA || {});
