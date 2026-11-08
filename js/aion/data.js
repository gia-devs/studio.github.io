(function (GIA) {
  GIA.aion = GIA.aion || {};
  var source = GIA.data && GIA.data.figures && GIA.data.figures.FIGURES || [];
  var aliases = {
    platon: ['Platón', 'Plato'], aristoteles: ['Aristóteles', 'Aristotle'],
    'rene-descartes': ['Descartes', 'René Descartes', 'Descartez'],
    'ibn-rushd': ['Averroes', 'Ibn Rushd'], 'michelangelo': ['Miguel Ángel', 'Michelangelo'],
    'vincent-van-gogh': ['Van Gogh', 'Vincent van Gogh', 'Vangot'],
    'pablo-picasso': ['Picasso', 'Pablo Picasso'], 'claude-monet': ['Monet', 'Claude Monet'],
    'salvador-dali': ['Dalí', 'Salvador Dalí'], 'hannah-arendt': ['Arendt', 'Hannah Arendt'],
    'simone-de-beauvoir': ['Beauvoir', 'Simone de Beauvoir'], 'frida-kahlo': ['Frida', 'Frida Kahlo']
  };
  var themes = {
    muerte: /muerte|morir|mortal|vida sencilla|temor a la muerte/,
    libertad: /libertad|autonomia|liberacion|eleccion/,
    duda: /duda|certeza|conocimiento|verdad/,
    belleza: /belleza|estetica|arte|pintura|escultura/,
    tiempo: /tiempo|historia|cambio|memoria/,
    identidad: /identidad|mujer|genero|yo|cuerpo/,
    poder: /poder|politica|colonialismo|totalitarismo/,
    etica: /etica|moral|virtud|responsabilidad/
  };
  GIA.aion.data = source.map(function (f) {
    var text = [f.bio || '', (f.disciplines || []).join(' '), (f.works || []).join(' ')].join(' ');
    var foundThemes = Object.keys(themes).filter(function (key) { return themes[key].test(GIA.aion.normalize(text)); });
    return {
      id: f.id, nombre: f.name || '', tipo: f.type === 'filosofo' ? 'filósofo' : f.type === 'escritor' ? 'escritor' : 'artista',
      alias: [f.name || '', f.id.replace(/-/g, ' ')].concat(aliases[f.id] || []).filter(Boolean),
      vida: f.years && typeof f.years === 'object' ? f.years : null,
      epoca: f.period || '', escuela_o_movimiento: Array.isArray(f.disciplines) ? f.disciplines.slice() : [],
      idea_central: (f.bio || '').split(/(?<=[.!?])\s/)[0] || '',
      ideas: [],
      obras: (Array.isArray(f.works) ? f.works : []).map(function (title) { return { titulo: title, por_que_importa: '' }; }),
      citas: f.quote ? [f.quote] : [],
      influido_por: Array.isArray(f.influences) ? f.influences.slice() : [],
      influyó_a: Array.isArray(f.influenced) ? f.influenced.slice() : [],
      temas: foundThemes, preguntas: [], curiosidad: '',
      resumen: f.bio || '', disciplinas: Array.isArray(f.disciplines) ? f.disciplines.slice() : [],
      popularidad: Number(f.popularity) || 0, score: Number(f.score) || 0
    };
  });
  GIA.aion.themes = themes;
})(window.GIA = window.GIA || {});
