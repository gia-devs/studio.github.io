// Retratos: imagen o degradado con iniciales / nombre.

import { esc } from '../core/utils.js';

export function portrait(figure) {
  if (figure.portrait) {
    return `<img class="poster" src="${esc(figure.portrait)}" alt="Retrato de ${esc(figure.name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block">`;
  }

  const initials = figure.name.split(/\s+/).slice(0, 2).map((p) => p[0]).join('');
  return `<div class="poster portrait-fallback" role="img" aria-label="Retrato de ${esc(figure.name)}" style="width:100%;height:100%">
    <span class="portrait-fallback__initials">${esc(initials)}</span>
    <span class="portrait-fallback__name">${esc(figure.name)}</span>
  </div>`;
}
