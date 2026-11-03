// Router por hash. Cada ruta carga su vista con import() dinámico.

import { errorState } from '../components/states.js';

const routes = [];
const listeners = new Set();
let cleanup = null;
let token = 0;
let current = { path: '/home', query: {} };

export function route(pattern, loader) {
  const keys = [];
  const source = pattern.replace(/:[^/]+/g, (m) => {
    keys.push(m.slice(1));
    return '([^/]+)';
  });
  routes.push({ re: new RegExp('^' + source + '/?$'), keys, loader });
}

export function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/home';
  const [path, qs = ''] = raw.split('?');
  return { path: path || '/home', query: Object.fromEntries(new URLSearchParams(qs)) };
}

export const getCurrent = () => current;
export const onRoute = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

export function navigate(path, { replace = false } = {}) {
  const hash = '#' + path;
  if (location.hash === hash) { resolve(); return; }
  if (replace) {
    history.replaceState(null, '', hash);
    resolve();
  } else {
    location.hash = path;
  }
}

export function setQuery(params) {
  const { path } = parseHash();
  const qs = new URLSearchParams(params).toString();
  history.replaceState(null, '', '#' + path + (qs ? '?' + qs : ''));
  current = { path, query: Object.fromEntries(new URLSearchParams(qs)) };
}

export const refresh = () => resolve();

function match(path) {
  for (const r of routes) {
    const m = r.re.exec(path);
    if (m) {
      const params = {};
      r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      return { r, params };
    }
  }
  return null;
}

async function resolve() {
  const mine = ++token;
  const view = document.getElementById('view');
  const { path, query } = parseHash();
  current = { path, query };

  if (cleanup) { try { cleanup(); } catch { /* noop */ } cleanup = null; }

  const found = match(path);
  let mod;
  let params = {};
  try {
    if (found) {
      params = found.params;
      mod = (await found.r.loader()).default;
    } else {
      mod = (await import('../views/notfound.js')).default;
    }
  } catch (err) {
    console.error(err);
    if (mine !== token) return;
    view.innerHTML = errorState({
      title: 'No pudimos cargar esta pantalla',
      text: 'Revisa tu conexión e inténtalo de nuevo.',
      retry: true,
    });
    return;
  }
  if (mine !== token) return;

  const ctx = { params, query, path };
  let html;
  try {
    html = await mod.render(ctx);
  } catch (err) {
    console.error(err);
    html = `<div class="page">${errorState({ title: 'Algo salió mal', text: 'No pudimos mostrar esta pantalla.', retry: true })}</div>`;
  }
  if (mine !== token) return;

  if (html && typeof html === 'object' && html.redirect) {
    navigate(html.redirect, { replace: true });
    return;
  }

  view.innerHTML = html;
  view.classList.remove('view-enter');
  void view.offsetWidth;
  view.classList.add('view-enter');

  const title = typeof mod.title === 'function' ? mod.title(ctx) : mod.title;
  document.title = title ? `${title} · G’IA` : "G’IA";

  try {
    const c = mod.mount?.(view, ctx);
    if (typeof c === 'function') cleanup = c;
  } catch (err) {
    console.error(err);
  }

  window.scrollTo(0, 0);
  view.focus({ preventScroll: true });
  listeners.forEach((fn) => fn(current));
}

export function startRouter() {
  window.addEventListener('hashchange', resolve);
  document.getElementById('view').addEventListener('click', (e) => {
    if (e.target.closest('[data-retry]')) resolve();
  });
  resolve();
}
