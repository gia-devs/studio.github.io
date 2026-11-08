(function (GIA) {
GIA.components = GIA.components || {};
GIA.components.search = GIA.components.search || {};
// Búsqueda global: filósofos, artistas y escritores.

const { esc, debounce } = GIA.core.utils;
const { FIGURES, topFigures, TYPE_LABELS, STATUS_LABELS } = GIA.data.figures;
const { openModal } = GIA.components.modal;
const { icon } = GIA.components.icons;

const norm = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function figureItem(f) {
  return `<li><a class="search-item" href="#/figura/${f.id}" data-close>
    <span class="search-item__ico">${icon(f.type === 'filosofo' ? 'book' : f.type === 'escritor' ? 'quote' : 'palette', { size: 18 })}</span>
    <span class="search-item__txt"><strong>${esc(f.name)}</strong><small>${esc(TYPE_LABELS[f.type])} · ${esc(f.disciplines.join(' · '))}</small></span>
  </a></li>`;
}

function results(q) {
  const n = norm(q.trim());
  if (!n) {
    return `<p class="search-label">Tendencias</p><ul>${topFigures(4).map(figureItem).join('')}</ul>`;
  }
  const list = FIGURES.filter((f) =>
    norm([f.name, f.epithet, f.country, f.period, f.disciplines.join(' '), f.works.join(' '), f.bio].join(' ')).includes(n)
  ).slice(0, 8);

  if (!list.length) {
    return `<p class="search-empty">No encontramos resultados para <strong>“${esc(q.trim())}”</strong>. Prueba con otro nombre, corriente o disciplina.</p>`;
  }
  return `<p class="search-label">Figuras</p><ul>${list.map(figureItem).join('')}</ul>`;
}

function openSearch() {
  const api = openModal({
    title: 'Buscar',
    headless: true,
    size: 'md',
    className: 'modal__panel--search',
    body: `
      <div class="search-box">${icon('search', { size: 20 })}
        <input class="search-input" type="search" placeholder="Nombre, corriente, disciplina…" autocomplete="off" aria-label="Buscar filósofos, artistas y escritores" data-autofocus>
      </div>
      <div class="search-results" aria-live="polite">${results('')}</div>`,
  });

  const input = api.el.querySelector('.search-input');
  const box = api.el.querySelector('.search-results');

  input.addEventListener('input', debounce(() => { box.innerHTML = results(input.value); }, 120));

  api.el.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const items = [...api.el.querySelectorAll('.search-item')];
    if (!items.length) return;
    e.preventDefault();
    const i = items.indexOf(document.activeElement);
    const next = e.key === 'ArrowDown' ? (i + 1) % items.length : (i <= 0 ? items.length - 1 : i - 1);
    items[next].focus();
  });

  return api;
}


Object.assign(GIA.components.search, { openSearch });
})(window.GIA = window.GIA || {});
