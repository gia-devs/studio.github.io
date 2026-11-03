// Destacados y contemporáneos.

import { FIGURES } from '../data/figures.js';
import { figureCard } from '../components/figureCard.js';

export default {
  title: 'Destacados',
  render() {
    const destacados = FIGURES.filter((f) => f.status === 'destacado' || f.status === 'contemporaneo')
      .sort((a, b) => b.popularity - a.popularity);
    return `<div class="page premieres">
      <header class="page-head">
        <p class="eyebrow">Selección editorial</p>
        <h1>Destacados</h1>
        <p>Figuras que merecen una lectura atenta hoy: clásicos vivos y voces contemporáneas.</p>
      </header>
      <section class="grid-movies featured-grid" aria-label="Figuras destacadas">
        ${destacados.map(figureCard).join('')}
      </section>
    </div>`;
  },
};
