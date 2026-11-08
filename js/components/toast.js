(function (GIA) {
GIA.components = GIA.components || {};
GIA.components.toast = GIA.components.toast || {};
// Avisos breves (toasts).

const { esc } = GIA.core.utils;
const { icon } = GIA.components.icons;

const ICONS = { info: 'info', success: 'check', error: 'alert' };

function toast(message, { type = 'info', duration = 2800 } = {}) {
  const host = document.getElementById('toasts');
  if (!host) return;
  while (host.children.length >= 3) host.firstElementChild.remove();

  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = `${icon(ICONS[type] || 'info', { size: 18 })}<span>${esc(message)}</span>`;
  host.appendChild(el);

  setTimeout(() => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 260);
  }, duration);
}


Object.assign(GIA.components.toast, { toast });
})(window.GIA = window.GIA || {});
