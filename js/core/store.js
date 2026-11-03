// Estado único de la app, persistido en localStorage ("gia:state").

const KEY = 'gia:state';

const DEFAULT = {
  v: 1,
  favorites: [],
  ratings: {},        // puntuaciones propias por figura (1–5 estrellas)
  reviews: [],        // reseñas locales del prototipo
  user: null,         // { name, email } (maqueta)
  settings: { reduceMotion: false },
};

const clone = (o) => JSON.parse(JSON.stringify(o));

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return clone(DEFAULT);
    const saved = JSON.parse(raw);
    const base = clone(DEFAULT);
    const merged = { ...base, ...saved, settings: { ...base.settings, ...(saved.settings || {}) } };
    if (!Array.isArray(merged.favorites)) merged.favorites = [];
    if (!merged.ratings || typeof merged.ratings !== 'object') merged.ratings = {};
    if (!Array.isArray(merged.reviews)) merged.reviews = [];
    return merged;
  } catch {
    return clone(DEFAULT);
  }
}

function normalize(saved) {
  const base = clone(DEFAULT);
  const merged = { ...base, ...saved, settings: { ...base.settings, ...(saved.settings || {}) } };
  if (!Array.isArray(merged.favorites)) merged.favorites = [];
  if (!merged.ratings || typeof merged.ratings !== 'object') merged.ratings = {};
  if (!Array.isArray(merged.reviews)) merged.reviews = [];
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

export const store = {
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
  export() {
    return JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
  },
  import(raw) {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.favorites)) {
      throw new Error('El archivo no contiene una copia válida de G’IA.');
    }
    state = normalize(parsed);
    persist();
    notify();
  },
};

export const isFavorite = (id) => state.favorites.includes(id);

export function toggleFavorite(id) {
  const has = isFavorite(id);
  store.set({ favorites: has ? state.favorites.filter((f) => f !== id) : [...state.favorites, id] });
  return !has;
}
