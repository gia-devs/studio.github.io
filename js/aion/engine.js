(function (GIA) {
  GIA.aion = GIA.aion || {};
  function fig(id) { return GIA.aion.data.find(function (f) { return f.id === id; }) || null; }
  function byMention(text) {
    var q = GIA.aion.normalize(text);
    return GIA.aion.data.filter(function (f) { return (f.alias || [f.nombre]).some(function (n) { return GIA.aion.matches(q, n) || q.indexOf(GIA.aion.normalize(n)) >= 0; }); });
  }
  function result(text, figures, suggestions) {
    return Promise.resolve({ texto: text, sugerencias: (suggestions || []).slice(0, 3), enlaces: (figures || []).map(function (f) { return { texto: 'Ver ficha de ' + f.nombre, href: '#/figura/' + encodeURIComponent(f.id), id: f.id }; }) });
  }
  function choose(list) { return list.length ? list[Math.floor(Math.random() * list.length)] : null; }
  function respond(message, context) {
    var q = String(message || '').trim();
    var memory = GIA.aion.memory.get();
    var figures = GIA.aion.data;
    var intent = GIA.aion.intents.detect(q, figures);
    var mentioned = intent.figures.length ? intent.figures : byMention(q);
    var followup = intent.name === 'followup' || /^(y |que |quien |como |por que|porque|donde|cual|cuentame|hablame|mas |sus |su |ella|el |eso|esa|tambien|puedes )/.test(intent.text);
    var explicitFigureQuestion = /^(quien fue|quien es|hablame de|dime sobre|biografia)\b/.test(intent.text);
    var current = mentioned[0] || (followup ? fig(memory.lastFigureId) || (context && fig(context.figureId)) : null);
    var template;
    if (intent.name === 'greeting' || intent.name === 'thanks' || intent.name === 'farewell') {
      template = GIA.aion.templates.choose(intent.name, memory);
      GIA.aion.memory.setTemplate(intent.name, template.index);
      return result(template.text, [], intent.name === 'farewell' ? [] : ['¿Por dónde empiezo?', 'Sorpréndeme']);
    }
    if (intent.name === 'compare' && mentioned.length >= 2) {
      GIA.aion.memory.setFigure(mentioned[1].id);
      return result('Se acercan a preguntas distintas. ' + mentioned[0].nombre + ': ' + (mentioned[0].idea_central || mentioned[0].resumen) + ' ' + mentioned[1].nombre + ': ' + (mentioned[1].idea_central || mentioned[1].resumen), mentioned.slice(0, 2), ['¿Qué tienen en común?', '¿En qué se diferencian?']);
    }
    if (intent.name === 'surprise') {
      var surprise = choose(figures);
      if (!surprise) return result('Todavía no tengo fichas en mi colección.');
      GIA.aion.memory.setFigure(surprise.id);
      return result(surprise.nombre + ': ' + (surprise.idea_central || surprise.resumen), [surprise], ['¿Qué pensaba?', '¿Qué obra recomiendas?']);
    }
    if (intent.name === 'start') {
      var paths = figures.slice().sort(function (a, b) { return b.popularidad - a.popularidad; }).slice(0, 3);
      return result('Podemos empezar por una pregunta sobre la vida y la muerte, una obra de arte o una idea sobre la libertad. ¿Qué te llama más?', paths, ['Una idea filosófica', 'Una obra de arte', 'Sorpréndeme']);
    }
    if (intent.name === 'concept') {
      var concepts = {
        cogito: ['El cogito de Descartes es la idea de que, aunque dude de todo, no puede dudar de que está pensando. Como imagen sencilla: dudar ya demuestra que hay alguien pensando.', 'rene-descartes'],
        mayeutica: ['La mayéutica es el método de preguntas asociado con Sócrates: en vez de dar una respuesta, ayuda a la otra persona a examinar lo que cree.', 'socrates'],
        claroscuro: ['El claroscuro crea contraste entre luz y sombra para dar fuerza y volumen a una escena; el catálogo relaciona ese uso con Caravaggio.', 'caravaggio'],
        imperativo: ['El imperativo categórico es una idea moral asociada con Kant: actuar según una regla que podrías querer que valiera para todas las personas.', 'immanuel-kant']
      };
      var key = /cogito/.test(intent.text) ? 'cogito' : /may[eé]utica/.test(intent.text) ? 'mayeutica' : /claroscuro/.test(intent.text) ? 'claroscuro' : 'imperativo';
      var concept = concepts[key], owner = fig(concept[1]);
      if (owner) GIA.aion.memory.setFigure(owner.id);
      return result(concept[0], owner ? [owner] : [], ['¿Quién habló de esta idea?', 'Cuéntame más']);
    }
    if (intent.name === 'theme') {
      var themeNames = ['muerte', 'libertad', 'duda', 'belleza', 'tiempo', 'identidad', 'poder', 'etica'];
      var theme = themeNames.find(function (name) { return intent.text.indexOf(GIA.aion.normalize(name)) >= 0; });
      var matches = figures.filter(function (f) { return theme ? f.temas.indexOf(theme) >= 0 : f.temas.length > 0; }).slice(0, 3);
      if (matches.length) return result('En mi colección, ' + matches.map(function (f) { return f.nombre; }).join(', ') + ' abren caminos para pensar ese tema. ¿A cuál nos acercamos?', matches, ['Sorpréndeme', '¿Por dónde empiezo?']);
    }
    if (explicitFigureQuestion && !mentioned.length) {
      template = GIA.aion.templates.choose('figure', memory);
      GIA.aion.memory.setTemplate('figure', template.index);
      var nearest = figures.slice().sort(function (a, b) { return b.popularidad - a.popularidad; }).slice(0, 3);
      return result(template.text + ' Quizá querías preguntar por ' + nearest.map(function (f) { return f.nombre; }).join(', ') + '.', nearest, nearest.map(function (f) { return 'Háblame de ' + f.nombre; }));
    }
    if (intent.name === 'figure' || intent.name === 'followup' || intent.name === 'work' || intent.name === 'influence' || intent.name === 'quote') {
      if (current) {
        if (intent.name === 'followup' && /y que mas|cuentame mas|hablame mas|mas sobre/.test(intent.text)) {
          GIA.aion.memory.setFigure(current.id);
          var listedWorks = current.obras.slice(0, 3).map(function (work) { return work.titulo; }).filter(Boolean);
          if (listedWorks.length) return result('En la ficha de ' + current.nombre + ' también aparecen ' + listedWorks.join(', ') + '. ¿Cuál te gustaría explorar?', [current], listedWorks.slice(0, 3));
          return result('La ficha de ' + current.nombre + ' todavía no incluye más detalles. ¿Quieres que exploremos otra figura?', [current]);
        }
        GIA.aion.memory.setFigure(current.id);
        if (intent.name === 'quote') return current.citas.length ? result('En la ficha de ' + current.nombre + ' aparece esta frase: “' + current.citas[0] + '”', [current]) : result('No tengo una cita verificada para ' + current.nombre + ' en esta ficha.', [current]);
        if (intent.name === 'influence') {
          var rel = current.influido_por.length ? 'Recibió influencias de ' + current.influido_por.join(', ') + '.' : 'No tengo registradas sus influencias en esta ficha.';
          var infl = current.influyó_a.length ? 'Su obra influyó en ' + current.influyó_a.join(', ') + '.' : '';
          return result(rel + ' ' + infl, [current]);
        }
        if (intent.name === 'work') {
          var work = current.obras[0];
          return result(work ? 'Podrías empezar por “' + work.titulo + '”. ' + (work.por_que_importa || 'La ficha la incluye entre sus obras.') : 'Aún no tengo obras registradas para ' + current.nombre + '.', [current]);
        }
        var idea = current.idea_central || current.resumen;
        var extra = idea && current.resumen.indexOf(idea) === 0 ? current.resumen.slice(idea.length).trim() : '';
        return result(current.nombre + ': ' + (idea || 'todavía tiene poca información en mi colección.') + (extra ? ' ' + extra : ''), [current], ['¿Qué pensaba?', '¿Qué obra recomiendas?', 'Dame una frase']);
      }
    }
    if (intent.name === 'work') {
      var recommended = current || choose(figures.filter(function (f) { return f.obras.length; }));
      if (recommended) { GIA.aion.memory.setFigure(recommended.id); var first = recommended.obras[0]; return result('Podrías empezar por “' + first.titulo + '”, de ' + recommended.nombre + (first.por_que_importa ? ': ' + first.por_que_importa : '.'), [recommended]); }
    }
    if (intent.name === 'unknown') {
      if (/clima|codigo|tarea|receta|noticias|precio|medic/.test(intent.text)) return result('Me dedico a conversar sobre filosofía, arte y literatura. Podemos explorar una idea, una figura o una obra.');
      if (current) return result('¿Te refieres a ' + current.nombre + ', o a otra figura? Dime el nombre y sigo desde ahí.', [current], figures.filter(function (f) { return f.id !== current.id; }).slice(0, 2).map(function (f) { return f.nombre; }));
    }
    template = GIA.aion.templates.choose('unknown', memory);
    GIA.aion.memory.setTemplate('unknown', template.index);
    var close = figures.slice().sort(function (a, b) { return b.popularidad - a.popularidad; }).slice(0, 3);
    return result(template.text + ' Estas fichas podrían servir como punto de partida: ' + close.map(function (f) { return f.nombre; }).join(', ') + '.', close, close.map(function (f) { return 'Háblame de ' + f.nombre; }));
  }
  GIA.aion.Aion = { respond: respond, test: function () { return GIA.aion.test(); } };
  GIA.Aion = GIA.aion.Aion;
})(window.GIA = window.GIA || {});
