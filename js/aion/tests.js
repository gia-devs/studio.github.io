(function (GIA) {
  GIA.aion = GIA.aion || {};
  async function run() {
    var cases = [
      ['quien fue socrates', 'Sócrates'], ['socrates vs platon', 'Platón'],
      ['que es el cogito', 'Descartes'], ['dame una frase de descartes', 'Descartes'],
      ['quien hablo de la muerte', 'En mi colección'], ['sorprendeme', '#/figura/'], ['y que mas?', 'Sócrates'],
      ['hola', 'Hola'], ['gracias', 'De nada'], ['cual es el clima', 'filosofía y arte'],
      ['descartez', 'Descartes'], ['quien fue Zorblax', 'no está en mi colección']
    ];
    var results = [];
    GIA.aion.memory.clear();
    for (var i = 0; i < cases.length; i++) {
      if (i === 6) { GIA.aion.memory.setFigure('socrates'); }
      if (i === 11) { GIA.aion.memory.clear(); }
      var answer = await GIA.aion.Aion.respond(cases[i][0], {});
      var normalizedAnswer = GIA.aion.normalize(answer.texto);
      var pass = i === 5 ? answer.enlaces.length > 0
        : i === 8 ? GIA.aion.intents.detect(cases[i][0], GIA.aion.data).name === 'thanks'
        : i === 7 ? GIA.aion.intents.detect(cases[i][0], GIA.aion.data).name === 'greeting'
        : i === 10 ? answer.enlaces.some(function (link) { return link.id === 'rene-descartes'; })
        : i === 11 ? answer.enlaces.length === 3 && normalizedAnswer.indexOf('zorblax') < 0
        : !cases[i][1] || normalizedAnswer.indexOf(GIA.aion.normalize(cases[i][1])) >= 0;
      results.push({ pregunta: cases[i][0], respuesta: answer.texto, resultado: pass ? 'PASA' : 'FALLA' });
    }
    console.table(results);
    return results;
  }
  GIA.aion.test = run;
})(window.GIA = window.GIA || {});
