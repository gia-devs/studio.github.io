(function (GIA) {
GIA.components = GIA.components || {};
GIA.components.rating = GIA.components.rating || {};
// Control de puntuación 1–5 estrellas.

const { store } = GIA.core.store;
const { createScope, esc } = GIA.core.utils;
const { toast } = GIA.components.toast;

function ratingPanel(figure) {
  const current = store.get().ratings[figure.id] || 0;
  return `<section class="rating-panel" aria-labelledby="rating-title" data-rating-panel="${esc(figure.id)}">
    <header class="rating-panel__head">
      <div><p class="eyebrow">Tu opinión</p><h2 id="rating-title">¿Qué te parece ${esc(figure.name)}?</h2><p class="rating-panel__intro">Valora su obra y, si quieres, cuéntanos qué te llamó la atención.</p></div>
      <span class="rating-panel__current" data-rating-label aria-live="polite">${current ? `${current} / 5` : 'Sin valorar'}</span>
    </header>
    <div class="rating-selection">
      <div class="rating-stars" role="group" aria-label="Valorar ${esc(figure.name)} de 1 a 5 estrellas">
        ${[1,2,3,4,5].map((n) => `<button type="button" class="rating-star" data-star="${n}" aria-label="${n} ${n === 1 ? 'estrella' : 'estrellas'}" aria-pressed="${n === current}" data-active="${n <= current}">${n <= current ? '★' : '☆'}</button>`).join('')}
      </div>
      <p class="rating-selection__hint" data-rating-hint>${current ? `Has elegido ${current} de 5 estrellas` : 'Elige de 1 a 5 estrellas'}</p>
    </div>
    <form class="review-form" data-review-form>
      <div class="review-form__label"><label for="review-text">Reseña <span>Opcional</span></label><small id="review-hint">Comparte una idea, obra o reflexión que te haya quedado.</small></div>
      <textarea id="review-text" name="text" maxlength="600" placeholder="Escribe aquí tu reseña…" rows="4" aria-describedby="review-hint"></textarea>
      <div class="review-form__footer"><small>Tu opinión se guarda en este dispositivo.</small><button class="btn btn--primary" type="submit" data-submit-label ${current ? '' : 'disabled'}>${current ? 'Guardar valoración' : 'Elige estrellas'}</button></div>
    </form>
  </section>
`;
}

function mountRating(root, figure) {
  const el = root.querySelector('[data-rating-panel]');
  if (!el) return () => {};
  const scope = createScope();
  let value = store.get().ratings[figure.id] || 0;

  const paint = () => {
    el.querySelectorAll('[data-star]').forEach((b) => {
      const n = Number(b.dataset.star);
      b.textContent = n <= value ? '★' : '☆';
      b.setAttribute('aria-pressed', String(n === value));
      b.setAttribute('data-active', String(n <= value));
    });
    el.querySelector('[data-rating-label]').textContent = value ? `${value} / 5` : 'Sin valorar';
    el.querySelector('[data-rating-hint]').textContent = value ? `Has elegido ${value} de 5 estrellas` : 'Elige de 1 a 5 estrellas';
    const submit = el.querySelector('[data-submit-label]');
    submit.disabled = !value;
    submit.textContent = value ? (el.querySelector('[name="text"]').value.trim() ? 'Guardar opinión' : 'Guardar valoración') : 'Elige estrellas';
  };

  scope.on(el, 'click', (e) => {
    const b = e.target.closest('[data-star]');
    if (!b) return;
    value = Number(b.dataset.star);
    paint();
  });

  scope.on(el.querySelector('[name="text"]'), 'input', paint);

  scope.on(el, 'submit', (e) => {
    if (!e.target.matches('[data-review-form]')) return;
    e.preventDefault();
    if (!value) return;
    const text = new FormData(e.target).get('text').trim();
    store.update((s) => {
      s.ratings[figure.id] = value;
      if (text) {
        s.reviews.push({
          figureId: figure.id,
          stars: value,
          text,
          date: new Intl.DateTimeFormat('es', { dateStyle: 'medium' }).format(new Date()),
        });
      }
      return s;
    });
    toast(text ? 'Tu valoración y reseña se guardaron' : 'Tu valoración se guardó');
    e.target.reset();
    paint();
  });

  return () => scope.cleanup();
}


Object.assign(GIA.components.rating, { ratingPanel, mountRating });
})(window.GIA = window.GIA || {});
