// Avisos breves (toasts).

import { esc } from '../core/utils.js';
import { icon } from './icons.js';

const ICONS = { info: 'info', success: 'check', error: 'alert' };

export function toast(message, { type = 'info', duration = 2800 } = {}) {
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
