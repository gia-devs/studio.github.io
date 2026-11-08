(function (GIA) {
GIA.components = GIA.components || {};
GIA.components.states = GIA.components.states || {};
// Estados vacíos, de error y de carga.

const { icon } = GIA.components.icons;
const { esc, range } = GIA.core.utils;

function actionHtml(a) {
  if (!a) return '';
  const cls = `btn ${a.variant === 'secondary' ? 'btn--secondary' : 'btn--primary'}`;
  if (a.href) return `<a class="${cls}" href="${esc(a.href)}">${esc(a.label)}</a>`;
  return `<button class="${cls}" type="button" ${a.attrs || ''}>${esc(a.label)}</button>`;
}

function emptyState({ title, text = '', icon: ic = 'sparkle', action = null, action2 = null }) {
  return `
    <div class="empty-state">
      <span class="empty-state__icon">${icon(ic, { size: 30 })}</span>
      <h3>${esc(title)}</h3>
      ${text ? `<p>${esc(text)}</p>` : ''}
      ${action || action2 ? `<div class="empty-state__actions">${actionHtml(action)}${actionHtml(action2)}</div>` : ''}
    </div>`;
}

function errorState({ title = 'Algo salió mal', text = '', retry = false, action = null }) {
  return `
    <div class="empty-state empty-state--error" role="alert">
      <span class="empty-state__icon">${icon('alert', { size: 30 })}</span>
      <h3>${esc(title)}</h3>
      ${text ? `<p>${esc(text)}</p>` : ''}
      <div class="empty-state__actions">
        ${retry ? `<button class="btn btn--primary" type="button" data-retry>${icon('refresh', { size: 18 })} Reintentar</button>` : ''}
        ${actionHtml(action)}
      </div>
    </div>`;
}

function skeletonGrid(n = 8) {
  return `<div class="grid-figures" aria-hidden="true">${range(n).map(() => `
    <div class="skeleton-card"><div class="skeleton skeleton--poster"></div><div class="skeleton skeleton--line"></div><div class="skeleton skeleton--line skeleton--short"></div></div>`).join('')}</div>`;
}


Object.assign(GIA.components.states, { emptyState, errorState, skeletonGrid });
})(window.GIA = window.GIA || {});
