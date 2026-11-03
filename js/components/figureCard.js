// Tarjeta de figura: retrato, tipo, disciplinas y favorito.

import { esc } from '../core/utils.js';
import { isFavorite } from '../core/store.js';
import { TYPE_LABELS, STATUS_LABELS, fmtYears } from '../data/figures.js';
import { portrait } from './portrait.js';
import { icon } from './icons.js';

export function figureCard(f) {
  const fav = isFavorite(f.id);
  return `
    <article class="movie-card" data-figure="${f.id}">
      <a class="movie-card__link" href="#/figura/${f.id}" aria-label="${esc(f.name)}. ${esc(TYPE_LABELS[f.type])}. ${esc(f.disciplines.join(', '))}">
        <div class="movie-card__poster">
          ${portrait(f)}
          <span class="badge badge--rating">${TYPE_LABELS[f.type]}</span>
          ${f.status === 'destacado' ? `<span class="badge badge--status">${STATUS_LABELS[f.status]}</span>` : ''}
          <span class="movie-card__overlay" aria-hidden="true"><span class="btn btn--primary btn--sm">Ver ficha</span></span>
        </div>
        <h3 class="movie-card__title">${esc(f.name)}</h3>
        <p class="movie-card__meta">${esc([f.disciplines[0], fmtYears(f.years)].filter(Boolean).join(' · '))}</p>
      </a>
      <button class="fav-btn" type="button" data-fav="${f.id}" aria-pressed="${fav}"
        aria-label="${fav ? 'Quitar de favoritos' : 'Añadir a favoritos'}: ${esc(f.name)}">${icon('heart', { size: 19 })}</button>
    </article>`;
}

export function syncFavButtons(root, id, on) {
  root.querySelectorAll(`[data-fav="${id}"]`).forEach((b) => {
    b.setAttribute('aria-pressed', String(on));
    const title = b.getAttribute('aria-label').split(': ').slice(1).join(': ');
    if (title) b.setAttribute('aria-label', `${on ? 'Quitar de favoritos' : 'Añadir a favoritos'}: ${title}`);
  });
}
