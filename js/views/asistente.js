(function (GIA) {
GIA.views = GIA.views || {};
GIA.views.asistente = {
  title: 'Aion',
  render: function () {
    return '<div class="page assistant-page"><section class="assistant-panel" aria-label="Conversación con Aion"><button class="btn btn--secondary btn--sm" type="button" data-aion-clear>Borrar conversación</button><div class="assistant-transcript" data-transcript aria-live="polite"></div><form class="assistant-form" data-form><label class="sr-only" for="assistant-input">Escribe tu pregunta</label><textarea id="assistant-input" name="question" rows="1" maxlength="500" placeholder="Conversemos sobre una idea o figura…" required></textarea><button class="btn btn--primary assistant-send" type="submit" aria-label="Enviar pregunta" disabled><span data-slot="icon"></span></button></form><p class="assistant-disclaimer">Respondo a partir de las fichas de G’IA.</p></section></div>';
  },
  mount: function (root, context) {
    var button = root.querySelector('.assistant-send');
    if (button) button.querySelector('[data-slot=icon]').innerHTML = GIA.components.icons.icon('arrowRight', { size: 19 });
    return GIA.aion.ui.mount(root, context);
  }
};
})(window.GIA = window.GIA || {});
