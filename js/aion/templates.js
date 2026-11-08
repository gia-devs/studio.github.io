(function (GIA) {
  GIA.aion = GIA.aion || {};
  var variants = {
    greeting: ['Hola. ¿Qué idea te gustaría explorar?', 'Hola. ¿Qué te da curiosidad hoy?', 'Hola. Podemos empezar por una persona, una obra o una pregunta.'],
    thanks: ['De nada. ¿Seguimos con otra idea?', 'Con gusto. ¿Qué parte te gustaría mirar ahora?', 'Me alegra que te sirva. ¿Seguimos explorando?'],
    farewell: ['Hasta luego. Las ideas siguen aquí cuando quieras volver.', 'Nos vemos. Que te acompañe alguna pregunta interesante.', 'Hasta pronto.'],
    unknown: ['Eso no lo tengo en mi colección todavía.', 'Aún no encuentro ese dato en mis fichas.', 'Esa idea todavía no está documentada en mi colección.'],
    figure: ['Esa figura no está en mi colección todavía.', 'Aún no tengo una ficha de esa persona.', 'No encuentro esa figura entre las fichas disponibles.']
  };
  function choose(kind, memory) {
    var choices = variants[kind] || variants.unknown;
    var previous = memory && memory.lastTemplate && memory.lastTemplate[kind];
    var options = choices.map(function (_, i) { return i; }).filter(function (i) { return i !== previous; });
    var pick = options.length ? options[Math.floor(Math.random() * options.length)] : 0;
    return { text: choices[pick], index: pick };
  }
  GIA.aion.templates = { choose: choose, variants: variants };
})(window.GIA = window.GIA || {});
