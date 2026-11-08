(function (GIA) {
GIA.views = GIA.views || {};
GIA.views.notfound = GIA.views.notfound || {};
const { emptyState } = GIA.components.states;

GIA.views.notfound = {
  title: 'Pantalla no encontrada',
  render() {
    return `<div class="page page--narrow">${emptyState({
      title: 'Esta pantalla no existe',
      text: 'Puede que el enlace esté incompleto o que la página ya no esté disponible.',
      icon: 'search',
      action: { label: 'Ir a Home', href: '#/home' },
      action2: { label: 'Explorar escritores', href: '#/escritores', variant: 'secondary' },
    })}</div>`;
  },
};


})(window.GIA = window.GIA || {});
