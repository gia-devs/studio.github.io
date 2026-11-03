// Ficha de una figura.

import { esc, createScope } from '../core/utils.js';
import { isFavorite } from '../core/store.js';
import { getFigure, similarTo, TYPE_LABELS, STATUS_LABELS, fmtYears } from '../data/figures.js';
import { portrait } from '../components/portrait.js';
import { figureCard } from '../components/figureCard.js';
import { icon } from '../components/icons.js';
import { emptyState } from '../components/states.js';
import { ratingPanel, mountRating } from '../components/rating.js';

export default {
  title: ({ params }) => getFigure(params.id)?.name || 'Figura',

  render({ params, query }) {
    const f = getFigure(params.id);
    if (!f) {
      return `<div class="page page--narrow">${emptyState({
        title: 'No encontramos esta figura',
        text: 'Puede que el enlace sea incorrecto.',
        icon: 'search',
        action: { label: 'Explorar filósofos', href: '#/filosofos' },
      })}</div>`;
    }
    const fav = isFavorite(f.id);
    const more = similarTo(f, 4);
    const categoryPath = f.type === 'artista' ? '/artistas' : '/filosofos';
    const returnTo = typeof query.return === 'string' && /^\/(artistas|filosofos)(?:\?|$)/.test(query.return)
      ? query.return
      : categoryPath;
    const returnLabel = f.type === 'artista' ? 'Artistas' : 'Filósofos';

    return `
      <div class="page detail" style="--c1:${f.c1};--c2:${f.c2}">
        <a class="back-link" href="#${esc(returnTo)}">${icon('chevronLeft', { size: 18 })} Volver a ${returnLabel}</a>

        <section class="detail__hero">
          <div class="detail__poster">${portrait(f)}</div>
          <div class="detail__info">
            <p class="eyebrow">${TYPE_LABELS[f.type]} · ${esc(f.period)} · ${STATUS_LABELS[f.status]}</p>
            <h1>${esc(f.name)}</h1>
            <p class="detail__tag">${esc(f.epithet)}</p>
            <ul class="detail__meta">
              <li><span class="badge badge--accent">${TYPE_LABELS[f.type]}</span></li>
              <li>${esc(f.disciplines.join(' · '))}</li>
              ${f.years ? `<li>${esc(fmtYears(f.years))}</li>` : ''}
              <li class="detail__score" aria-label="Valoración ${f.score.toFixed(1)} de 10">${icon('star', { size: 16 })} ${f.score.toFixed(1)} / 10</li>
            </ul>
            <p class="detail__synopsis">${esc(f.bio)}</p>
            ${f.quote ? `<blockquote class="detail__quote"><p>“${esc(f.quote)}”</p></blockquote>` : ''}
            <div class="detail__secondary">
              <button class="btn btn--secondary fav-toggle" type="button" data-fav="${f.id}" aria-pressed="${fav}"
                aria-label="${fav ? 'Quitar de favoritos' : 'Añadir a favoritos'}: ${esc(f.name)}">
                ${icon('heart', { size: 17 })} <span data-fav-text>${fav ? 'En favoritos' : 'Favorito'}</span>
              </button>
            </div>
          </div>
        </section>

        <section class="section detail__facts" aria-label="Ficha">
          <dl class="facts">
            <div><dt>Tipo</dt><dd>${TYPE_LABELS[f.type]}</dd></div>
            <div><dt>Disciplinas</dt><dd>${esc(f.disciplines.join(', '))}</dd></div>
            <div><dt>Periodo</dt><dd>${esc(f.period)}</dd></div>
            ${f.years ? `<div><dt>Años</dt><dd>${esc(fmtYears(f.years))}</dd></div>` : ''}
            <div><dt>País / región</dt><dd>${esc(f.country)}</dd></div>
            <div><dt>Obras</dt><dd>${esc(f.works.join(', '))}</dd></div>
            ${f.influences?.length ? `<div><dt>Influencias</dt><dd>${esc(f.influences.join(', '))}</dd></div>` : ''}
            ${f.influenced?.length ? `<div><dt>Influyó en</dt><dd>${esc(f.influenced.join(', '))}</dd></div>` : ''}
          </dl>
        </section>

        ${ratingPanel(f)}

        <section class="section" aria-labelledby="more-h">
          <div class="section-head"><h2 id="more-h">Figuras relacionadas</h2></div>
          <div class="grid-movies grid-movies--4">${more.map(figureCard).join('')}</div>
        </section>
      </div>`;
  },

  mount(root, { params }) {
    const f = getFigure(params.id);
    if (!f) return undefined;
    const scope = createScope();
    const unmountRating = mountRating(root, f);
    scope.add(unmountRating);

    const sync = () => {
      const t = root.querySelector('[data-fav-text]');
      const b = root.querySelector('.fav-toggle');
      if (t && b) t.textContent = b.getAttribute('aria-pressed') === 'true' ? 'En favoritos' : 'Favorito';
    };
    scope.on(document, 'favchange', sync);
    return () => scope.cleanup();
  },
};
