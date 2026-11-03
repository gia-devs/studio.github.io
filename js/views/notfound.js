import { emptyState } from '../components/states.js';

export default {
  title: 'Pantalla no encontrada',
  render() {
    return `<div class="page page--narrow">${emptyState({
      title: 'Esta pantalla no existe',
      text: 'Puede que el enlace esté incompleto o que la página ya no esté disponible.',
      icon: 'search',
      action: { label: 'Ir a Home', href: '#/home' },
      action2: { label: 'Explorar artistas', href: '#/artistas', variant: 'secondary' },
    })}</div>`;
  },
};
