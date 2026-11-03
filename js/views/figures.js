// Catálogo de figuras: filtros por tipo, disciplina y periodo.

import { esc, createScope, debounce, plural } from '../core/utils.js';
import { FIGURES, TYPE_LABELS } from '../data/figures.js';
import { setQuery } from '../core/router.js';
import { figureCard } from '../components/figureCard.js';
import { emptyState, skeletonGrid } from '../components/states.js';
import { icon } from '../components/icons.js';

const TABS = [
  { id: 'todos', label: 'Todos' },
  { id: 'filosofo', label: 'Filósofos' },
  { id: 'artista', label: 'Artistas' },
];

const SORTS = [
  { id: 'popularidad', label: 'Popularidad' },
  { id: 'nombre', label: 'Nombre (A–Z)' },
  { id: 'score', label: 'Valoración' },
];

function applyFilters({ tab, q, discipline, period, sort }) {
  const norm = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const nq = norm(q);

  let list = tab === 'todos' ? [...FIGURES] : FIGURES.filter((f) => f.type === tab);
  if (nq) list = list.filter((f) => norm([f.name, f.epithet, f.country, f.disciplines.join(' '), f.works.join(' ')].join(' ')).includes(nq));
  if (discipline) list = list.filter((f) => f.disciplines.includes(discipline));
  if (period) list = list.filter((f) => f.period === period);

  const by = {
    popularidad: (a, b) => b.popularity - a.popularity,
    nombre: (a, b) => a.name.localeCompare(b.name, 'es'),
    score: (a, b) => b.score - a.score,
  }[sort] || ((a, b) => b.popularity - a.popularity);
  return list.sort(by);
}

export default {
  title: ({ path }) => path === '/artistas' ? 'Artistas' : path === '/filosofos' ? 'Filósofos' : 'Figuras',

  render({ query, path }) {
    const fixedType = path === '/artistas' ? 'artista' : path === '/filosofos' ? 'filosofo' : null;
    const tab = fixedType || (TABS.some((t) => t.id === query.type) ? query.type : (query.tab || 'todos'));
    const fixed = !!fixedType;
    const pageTitle = fixedType === 'artista' ? 'Artistas' : fixedType === 'filosofo' ? 'Filósofos' : 'Filósofos y artistas';
    const categoryFigures = fixedType ? FIGURES.filter((f) => f.type === fixedType) : FIGURES;
    const categoryDisciplines = [...new Set(categoryFigures.flatMap((f) => f.disciplines))].sort((a, b) => a.localeCompare(b, 'es'));
    const categoryPeriods = [...new Set(categoryFigures.map((f) => f.period))].sort((a, b) => a.localeCompare(b, 'es'));
    return `
      <div class="page movies">
        <header class="page-head">
          <p class="eyebrow">Catálogo</p>
          <h1>${pageTitle}</h1>
          <p>${fixedType === 'artista' ? 'Explora artistas, obras y movimientos que transformaron la cultura.' : fixedType === 'filosofo' ? 'Explora pensadores, ideas y tradiciones que transformaron nuestra forma de ver el mundo.' : 'Explora el pensamiento y la creación a través de las figuras que han marcado la historia.'}</p>
        </header>

        <div class="tabs" role="tablist" aria-label="Tipo de figura" ${fixed ? 'hidden' : ''}>
          ${TABS.map((t) => `<button class="tab" role="tab" type="button" id="tab-${t.id}" data-tab="${t.id}"
            aria-selected="${t.id === tab}" aria-controls="figures-panel" tabindex="${t.id === tab ? 0 : -1}">${t.label}</button>`).join('')}
        </div>

        <div class="toolbar">
          <label class="toolbar__search">
            ${icon('search', { size: 18 })}
            <span class="sr-only">Buscar en esta lista</span>
            <input class="input" type="search" name="q" placeholder="Buscar por nombre, obra o disciplina" value="${esc(query.q || '')}" autocomplete="off">
          </label>
          <label class="field toolbar__sel">
            <span class="field__label">Disciplina</span>
            <select class="select" name="discipline">
              <option value="">Todas</option>
              ${categoryDisciplines.map((d) => `<option value="${esc(d)}" ${query.discipline === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}
            </select>
          </label>
          <label class="field toolbar__sel">
            <span class="field__label">Periodo</span>
            <select class="select" name="period">
              <option value="">Todos</option>
              ${categoryPeriods.map((p) => `<option value="${esc(p)}" ${query.period === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}
            </select>
          </label>
          <label class="field toolbar__sel">
            <span class="field__label">Ordenar por</span>
            <select class="select" name="sort">
              ${SORTS.map((s) => `<option value="${s.id}" ${query.sort === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}
            </select>
          </label>
        </div>

        <p class="results-count" data-count aria-live="polite"></p>
        <div id="figures-panel" role="tabpanel" aria-labelledby="tab-${tab}" data-panel>${skeletonGrid(8)}</div>
      </div>`;
  },

  mount(root, { query, path }) {
    const scope = createScope();
    const st = {
      tab: path === '/artistas' ? 'artista' : path === '/filosofos' ? 'filosofo' : (TABS.some((t) => t.id === query.type) ? query.type : (query.tab || 'todos')),
      q: query.q || '',
      discipline: query.discipline || '',
      period: query.period || '',
      sort: query.sort || 'popularidad',
    };

    const panel = root.querySelector('[data-panel]');
    const count = root.querySelector('[data-count]');
    const tabs = [...root.querySelectorAll('[data-tab]')];

    function sync() {
      const params = {};
      if (st.tab !== 'todos') params.type = st.tab;
      if (st.q) params.q = st.q;
      if (st.discipline) params.discipline = st.discipline;
      if (st.period) params.period = st.period;
      if (st.sort !== 'popularidad') params.sort = st.sort;
      setQuery(params);
    }

    function draw() {
      const list = applyFilters(st);
      count.textContent = plural(list.length, 'figura', 'figuras');
      panel.setAttribute('aria-labelledby', `tab-${st.tab}`);
      if (!list.length) {
        const filtered = st.q || st.discipline || st.period;
        panel.innerHTML = emptyState({
          title: filtered ? 'Sin resultados' : 'Aún no hay figuras aquí',
          text: filtered ? 'Prueba quitando algún filtro o buscando otro nombre.' : 'Vuelve pronto.',
          icon: 'search',
          action: filtered ? { label: 'Limpiar filtros', attrs: 'data-clear' } : null,
        });
        return;
      }
      const returnTo = window.location.hash.replace(/^#/, '');
      panel.innerHTML = `<div class="grid-movies">${list.map((figure) => figureCard(figure, returnTo)).join('')}</div>`;
    }

    function setTab(id, focus = false) {
      st.tab = id;
      tabs.forEach((t) => {
        const on = t.dataset.tab === id;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      sync();
      draw();
    }

    tabs.forEach((t, i) => {
      scope.on(t, 'click', () => setTab(t.dataset.tab));
      scope.on(t, 'keydown', (e) => {
        const keys = { ArrowRight: 1, ArrowLeft: -1 };
        if (e.key in keys) { e.preventDefault(); setTab(tabs[(i + keys[e.key] + tabs.length) % tabs.length].dataset.tab, true); }
      });
    });

    const search = root.querySelector('[name="q"]');
    scope.on(search, 'input', debounce(() => { st.q = search.value.trim(); sync(); draw(); }, 160));

    ['discipline', 'period', 'sort'].forEach((n) => {
      const el = root.querySelector(`[name="${n}"]`);
      scope.on(el, 'change', () => { st[n] = el.value; sync(); draw(); });
    });

    scope.on(panel, 'click', (e) => {
      if (!e.target.closest('[data-clear]')) return;
      Object.assign(st, { q: '', discipline: '', period: '', sort: 'popularidad' });
      search.value = '';
      root.querySelector('[name="discipline"]').value = '';
      root.querySelector('[name="period"]').value = '';
      root.querySelector('[name="sort"]').value = 'popularidad';
      sync();
      draw();
    });

    scope.timeout(draw, 120);
    return () => scope.cleanup();
  },
};
