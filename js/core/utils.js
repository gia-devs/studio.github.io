// Utilidades compartidas: DOM, formato, fechas, aleatoriedad determinista.

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

export const round2 = (n) => Math.round(n * 100) / 100;
export const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
export const range = (n) => Array.from({ length: n }, (_, i) => i);
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  document.documentElement.classList.contains('reduce-motion');

/* ---------- Aleatoriedad determinista ---------- */
function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

export function seeded(seed) {
  let a = xmur3(String(seed))();
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- Fechas ---------- */
const pad2 = (n) => String(n).padStart(2, '0');
export const isoDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export function fromIso(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  x.setHours(0, 0, 0, 0);
  return x;
}

const fmt = (d, opts) => new Intl.DateTimeFormat('es', opts).format(d);
export const longDate = (d) => fmt(d, { weekday: 'long', day: 'numeric', month: 'long' });
export const shortDate = (d) => fmt(d, { day: 'numeric', month: 'short' });
export const weekdayShort = (d) => fmt(d, { weekday: 'short' }).replace('.', '');
export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const fmtYears = (from, to) => {
  if (!from) return '';
  if (!to) return `${from} –`;
  return `${from} – ${to}`;
};

/* ---------- Ciclo de vida de las vistas ---------- */
export function createScope() {
  const cleanups = [];
  return {
    on(target, type, fn, opts) {
      target.addEventListener(type, fn, opts);
      cleanups.push(() => target.removeEventListener(type, fn, opts));
    },
    timeout(fn, ms) {
      const id = setTimeout(fn, ms);
      cleanups.push(() => clearTimeout(id));
      return id;
    },
    interval(fn, ms) {
      const id = setInterval(fn, ms);
      cleanups.push(() => clearInterval(id));
      return id;
    },
    add(fn) { cleanups.push(fn); },
    cleanup() {
      while (cleanups.length) {
        try { cleanups.pop()(); } catch { /* noop */ }
      }
    },
  };
}

export function debounce(fn, ms = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* noop */ }
    ta.remove();
    return ok;
  }
}

export const initials = (name) =>
  String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || '·';

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
