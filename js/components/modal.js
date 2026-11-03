// Modal accesible.

import { esc } from '../core/utils.js';
import { icon } from './icons.js';

const stack = [];
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function lockScroll() {
  document.body.style.overflow = stack.length ? 'hidden' : '';
}

export function openModal({ title = '', body = '', actions = [], size = 'md', headless = false, className = '', onClose } = {}) {
  const root = document.getElementById('modal-root');
  const previous = document.activeElement;
  const uid = 'm' + Math.random().toString(36).slice(2, 8);

  const wrap = document.createElement('div');
  wrap.className = 'modal';
  wrap.innerHTML = `
    <div class="modal__backdrop" data-close></div>
    <div class="modal__panel modal__panel--${size} ${className}" role="dialog" aria-modal="true" aria-labelledby="${uid}-t" tabindex="-1">
      ${headless
        ? `<h2 class="sr-only" id="${uid}-t">${esc(title)}</h2>`
        : `<header class="modal__head"><h2 id="${uid}-t">${esc(title)}</h2>
             <button class="icon-btn" type="button" data-close aria-label="Cerrar">${icon('close')}</button></header>`}
      <div class="modal__body">${body}</div>
      ${actions.length ? `<footer class="modal__foot">${actions.map((a, i) =>
        `<button class="btn btn--${a.variant || 'secondary'}" type="button" data-action="${i}">${esc(a.label)}</button>`).join('')}</footer>` : ''}
    </div>`;
  root.appendChild(wrap);

  const panel = wrap.querySelector('.modal__panel');
  let closed = false;

  const api = {
    el: panel,
    close() {
      if (closed) return;
      closed = true;
      wrap.remove();
      const i = stack.indexOf(api);
      if (i >= 0) stack.splice(i, 1);
      lockScroll();
      document.removeEventListener('keydown', onKey, true);
      if (previous && document.contains(previous)) previous.focus?.({ preventScroll: true });
      onClose?.();
    },
  };

  function onKey(e) {
    if (stack[stack.length - 1] !== api) return;
    if (e.key === 'Escape') { e.stopPropagation(); api.close(); return; }
    if (e.key !== 'Tab') return;
    const items = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (!items.length) { e.preventDefault(); panel.focus(); return; }
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  wrap.addEventListener('click', async (e) => {
    if (e.target.closest('[data-close]')) { api.close(); return; }
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const a = actions[Number(btn.dataset.action)];
    const result = await a.onClick?.(api);
    if (result !== false && a.close !== false) api.close();
  });

  document.addEventListener('keydown', onKey, true);
  stack.push(api);
  lockScroll();

  const autofocus = panel.querySelector('[data-autofocus]') || panel.querySelector('.modal__foot .btn--primary') || panel;
  requestAnimationFrame(() => autofocus.focus({ preventScroll: true }));
  return api;
}

export const closeAllModals = () => [...stack].forEach((m) => m.close());

export function confirmDialog({ title, text = '', confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false }) {
  return new Promise((resolve) => {
    let answered = false;
    const done = (v) => { if (!answered) { answered = true; resolve(v); } };
    openModal({
      title, size: 'sm',
      body: text ? `<p class="muted">${esc(text)}</p>` : '',
      actions: [
        { label: cancelLabel, variant: 'secondary', onClick: () => done(false) },
        { label: confirmLabel, variant: danger ? 'danger' : 'primary', onClick: () => done(true) },
      ],
      onClose: () => done(false),
    });
  });
}
