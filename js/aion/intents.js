(function (GIA) {
  GIA.aion = GIA.aion || {};
  function detect(text, figures) {
    var q = GIA.aion.normalize(text);
    var found = [];
    (figures || []).forEach(function (f) {
      var alias = f.alias || [f.nombre];
      if (alias.some(function (name) { return GIA.aion.matches(q, name) || q.indexOf(GIA.aion.normalize(name)) >= 0; })) found.push(f);
    });
    var byName = /\b(vs|versus|compara|comparar|diferencia|diferencias|entre|tienen en comun)\b/.test(q);
    var intent = 'unknown';
    if (/^(hola|buenas|hey|que tal|buenos dias|buenas tardes|buenas noches)$/.test(q)) intent = 'greeting';
    else if (/^(gracias|muchas gracias|te lo agradezco)$/.test(q)) intent = 'thanks';
    else if (/^(adios|hasta luego|nos vemos|chao)$/.test(q)) intent = 'farewell';
    else if (/sorprend|al azar|uno al azar|random/.test(q)) intent = 'surprise';
    else if (/por donde empiezo|como empiezo|que puedo explorar|que me recomiendas/.test(q)) intent = 'start';
    else if (byName && found.length >= 2) intent = 'compare';
    else if (/cita|frase/.test(q)) intent = 'quote';
    else if (/influy|influencia|inspir/.test(q)) intent = 'influence';
    else if (/obra|libro|pintura|escultura|que leo|recomiend/.test(q)) intent = 'work';
    else if (/tema|quien hablo|quien escribio|quien penso/.test(q) || /\b(muerte|libertad|duda|belleza|tiempo|identidad|poder|etica)\b/.test(q)) intent = 'theme';
    else if (/\b(cogito|may[eé]utica|imperativo categorico|claroscuro)\b/.test(q)) intent = 'concept';
    else if (/y que mas|cuentame mas|hablame mas|mas sobre|que pensaba|idea principal|explicame|que opinaba/.test(q)) intent = 'followup';
    else if (/quien fue|quien es|hablame de|dime sobre|biografia|que pensaba|idea principal|explicame/.test(q) || found.length) intent = 'figure';
    else if (found.length) intent = 'figure';
    return { name: intent, figures: found, text: q };
  }
  GIA.aion.intents = { detect: detect };
})(window.GIA = window.GIA || {});
