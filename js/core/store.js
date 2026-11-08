(function (GIA) {
GIA.core = GIA.core || {};
GIA.core.store = GIA.core.store || {};
// Estado único de la app, persistido en localStorage ("gia:state").

const KEY = 'gia:state';

const DEFAULT = {
  v: 1,
  favorites: [],
  ratings: {},        // puntuaciones propias por figura (1–5 estrellas)
  reviews: [],        // reseñas locales del prototipo
};

const clone = (o) => JSON.parse(JSON.stringify(o));

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return clone(DEFAULT);
    const saved = JSON.parse(raw);
    const base = clone(DEFAULT);
    const merged = { ...base, ...saved };
    if (!Array.isArray(merged.favorites)) merged.favorites = [];
    if (!merged.ratings || typeof merged.ratings !== 'object') merged.ratings = {};
    if (!Array.isArray(merged.reviews)) merged.reviews = [];
    const hadProfileData = Object.prototype.hasOwnProperty.call(merged, 'user') || Object.prototype.hasOwnProperty.call(merged, 'settings');
    delete merged.user;
    delete merged.settings;
    if (hadProfileData) { try { localStorage.setItem(KEY, JSON.stringify(merged)); } catch { /* purga opcional */ } }
    return merged;
  } catch {
    return clone(DEFAULT);
  }
}

function normalize(saved) {
  const base = clone(DEFAULT);
  const merged = { ...base, ...saved };
  if (!Array.isArray(merged.favorites)) merged.favorites = [];
  if (!merged.ratings || typeof merged.ratings !== 'object') merged.ratings = {};
  if (!Array.isArray(merged.reviews)) merged.reviews = [];
  delete merged.user;
  delete merged.settings;
  return merged;
}

let state = load();
const subs = new Set();

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* sin almacenamiento */ }
}
function notify() { subs.forEach((fn) => { try { fn(state); } catch (e) { console.error(e); } }); }

// Mantiene sincronizadas las pestañas abiertas del mismo navegador.
window.addEventListener('storage', (event) => {
  if (event.key !== KEY) return;
  try {
    state = event.newValue ? normalize(JSON.parse(event.newValue)) : clone(DEFAULT);
    notify();
  } catch { /* conserva el estado actual si otra pestaña guardó datos inválidos */ }
});

const store = {
  get: () => state,
  set(patch) {
    state = { ...state, ...patch };
    persist();
    notify();
  },
  update(fn) {
    const next = fn(clone(state));
    if (next) state = next;
    persist();
    notify();
  },
  subscribe(fn) {
    subs.add(fn);
    return () => subs.delete(fn);
  },
  reset() {
    state = clone(DEFAULT);
    persist();
    notify();
  },
};

const isFavorite = (id) => state.favorites.includes(id);

function toggleFavorite(id) {
  const has = isFavorite(id);
  store.set({ favorites: has ? state.favorites.filter((f) => f !== id) : [...state.favorites, id] });
  return !has;
}


Object.assign(GIA.core.store, { store, isFavorite, toggleFavorite });
})(window.GIA = window.GIA || {});
