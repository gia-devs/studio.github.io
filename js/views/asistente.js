// Aion conversa primero desde el catálogo y amplía con Wikipedia cuando hace falta.

import { createScope, esc } from '../core/utils.js';
import { FIGURES, TYPE_LABELS, fmtYears, similarTo } from '../data/figures.js';
import { icon } from '../components/icons.js';

async function searchWikipedia(question) {
  const params = new URLSearchParams({
    action: 'query', generator: 'search', gsrsearch: question, gsrlimit: '1',
    prop: 'extracts', exintro: '1', explaintext: '1', exsentences: '4',
    format: 'json', formatversion: '2', origin: '*',
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`https://es.wikipedia.org/w/api.php?${params}`, {
      headers: { Accept: 'application/json' }, signal: controller.signal,
    });
    if (!response.ok) throw new Error('Wikipedia no está disponible ahora.');
    const data = await response.json();
    const page = data.query?.pages?.[0];
    if (!page?.extract) return null;
    const url = `https://es.wikipedia.org/wiki/${encodeURIComponent(page.title).replace(/%20/g, '_')}`;
    return { title: page.title, extract: page.extract, url };
  } finally {
    clearTimeout(timeout);
  }
}

const normalize = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function findFigures(question) {
  const q = normalize(question);
  return FIGURES.filter((figure) => [figure.name, figure.id.replaceAll('-', ' '), ...figure.works]
    .some((term) => {
      const normalizedTerm = normalize(term);
      return normalizedTerm.length > 3 && q.includes(normalizedTerm);
    }));
}

function linkedName(figure) {
  return `<a href="#/figura/${figure.id}">${esc(figure.name)}</a>`;
}

function catalogSource(figure) {
  return `<p class="assistant-source">Desde el catálogo de G’IA · <a href="#/figura/${figure.id}">Abrir ficha</a></p>`;
}

function figureAnswer(figure, question) {
  const q = normalize(question);
  const asksWorks = /obra|pint|escrib|libro|creo|hizo|trabajo/.test(q);
  const asksInfluence = /influ|inspir|relacion|parecid|conecto/.test(q);
  let body;
  if (asksWorks) {
    body = `<p>${linkedName(figure)} creó, escribió o es conocida por obras como <strong>${esc(figure.works.slice(0, 4).join(' · '))}</strong>.</p><p>¿Hay alguna que te gustaría explorar con más detalle?</p>`;
  } else if (asksInfluence) {
    body = `<p>${linkedName(figure)} recibió influencias de <strong>${esc(figure.influences?.join(' · ') || 'distintas tradiciones de su época')}</strong> y su trabajo influyó en <strong>${esc(figure.influenced?.join(' · ') || 'generaciones posteriores')}</strong>.</p><p>¿Quieres que comparemos su trayectoria con otra figura?</p>`;
  } else {
    const years = fmtYears(figure.years);
    body = `<p>${linkedName(figure)} es ${esc(TYPE_LABELS[figure.type].toLowerCase())}${years ? ` (${esc(years)})` : ''}. ${esc(figure.bio)}</p><p><strong>Para empezar:</strong> ${esc(figure.works.slice(0, 3).join(' · '))}.</p><p>¿Qué te interesa más: sus ideas, su vida o una obra concreta?</p>`;
  }
  return `${body}${catalogSource(figure)}`;
}

function comparisonAnswer(first, second) {
  return `<p>${linkedName(first)} y ${linkedName(second)} coinciden en que ambos forman parte de la historia del pensamiento y la creación, pero se acercan a ella desde lugares distintos.</p><p><strong>${esc(first.name)}</strong>: ${esc(first.disciplines.slice(0, 2).join(' · '))}. ${esc(first.bio)}</p><p><strong>${esc(second.name)}</strong>: ${esc(second.disciplines.slice(0, 2).join(' · '))}. ${esc(second.bio)}</p><p>¿Quieres que compare sus ideas, sus obras o el contexto en que vivieron?</p>`;
}

function recommendationAnswer(question, lastFigure) {
  const q = normalize(question);
  const type = /artista|pintor|pintura|obra|escultor/.test(q) ? 'artista'
    : /filosof|pensador|idea|etica/.test(q) ? 'filosofo' : null;
  let picks = lastFigure && /parecid|similar|relacion|como esa|como este/.test(q)
    ? similarTo(lastFigure, 3)
    : [...FIGURES].filter((figure) => !type || figure.type === type)
      .sort((a, b) => b.popularity - a.popularity).slice(0, 3);
  if (type) picks = picks.filter((figure) => figure.type === type);
  if (!picks.length) picks = [...FIGURES].sort((a, b) => b.popularity - a.popularity).slice(0, 3);
  return `<p>¡Claro! Por lo que mencionas, podrías empezar por ${picks.map(linkedName).join(', ')}. Cada ficha tiene una breve introducción y obras para seguir explorando.</p><p>¿Cuál te llama más la atención?</p>`;
}

function message(role, html) {
  return `<article class="assistant-message assistant-message--${role}"><div class="assistant-message__avatar"${role === 'assistant' ? ' title="Aion" aria-label="Aion"' : ''}>${role === 'assistant' ? 'A' : 'Tú'}</div><div class="assistant-message__body">${html}</div></article>`;
}

export default {
  title: 'Aion',
  render() {
    return `<div class="page assistant-page">
      <section class="assistant-panel" aria-label="Conversación con Aion">
        <div class="assistant-transcript" data-transcript aria-live="polite">${message('assistant', '<p>Hola, soy Aion.</p>')}</div>
        <form class="assistant-form" data-form><label class="sr-only" for="assistant-input">Escribe tu pregunta</label><textarea id="assistant-input" name="question" rows="1" maxlength="500" placeholder="Conversemos sobre una idea o figura…" required></textarea><button class="btn btn--primary assistant-send" type="submit" aria-label="Enviar pregunta">${icon('arrowRight', { size: 19 })}</button></form>
        <p class="assistant-disclaimer">Tus preguntas sobre figuras se responden con el catálogo; Wikipedia aporta contexto cuando hace falta.</p>
      </section>
    </div>`;
  },
  mount(root) {
    const scope = createScope();
    const transcript = root.querySelector('[data-transcript]');
    const form = root.querySelector('[data-form]');
    const input = form.elements.question;
    const send = form.querySelector('button[type=submit]');
    let lastFigure = null;

    async function ask(raw) {
      const q = raw.trim();
      if (!q) return;
      transcript.insertAdjacentHTML('beforeend', message('user', `<p>${esc(q)}</p>`));
      const pendingId = `assistant-pending-${Date.now()}`;
      transcript.insertAdjacentHTML('beforeend', `<div id="${pendingId}">${message('assistant', '<p>A ver qué podemos descubrir…</p>')}</div>`);
      send.disabled = true;
      input.value = '';
      transcript.scrollTop = transcript.scrollHeight;
      let answer;
      try {
        const normalized = normalize(q);
        const matches = findFigures(q);
        const comparing = /compara|diferencia|parecid|tienen en comun|relaciona/.test(normalized);
        const recommendation = /recomiend|sugier|que puedo explorar|por donde empiezo|quiero descubrir/.test(normalized);
        const greeting = /^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|que tal)[!.?\s]*$/.test(normalized);
        const thanks = /^(gracias|muchas gracias|genial gracias|perfecto gracias)[!.?\s]*$/.test(normalized);
        const followUp = /^(y |que |quien |como |por que|porque|donde|cual|cuentame|hablame|mas |sus |su |ella|el |eso|esa|tambien|puedes )/.test(normalized);

        if (greeting) {
          answer = '<p>¡Hola! ¿Qué te gustaría explorar hoy?</p>';
        } else if (thanks) {
          answer = '<p>¡De nada! Me alegra acompañarte. ¿Seguimos con otra figura o quieres profundizar en esta idea?</p>';
        } else if (comparing && matches.length >= 2) {
          lastFigure = matches[1];
          answer = comparisonAnswer(matches[0], matches[1]);
        } else if (matches.length >= 2) {
          answer = `<p>Veo que te interesan ${matches.slice(0, 2).map(linkedName).join(' y ')}. ¿Quieres que compare sus ideas o prefieres conocer a una primero?</p>`;
          lastFigure = matches[0];
        } else if (matches.length === 1) {
          lastFigure = matches[0];
          answer = figureAnswer(lastFigure, q);
        } else if (lastFigure && followUp) {
          answer = figureAnswer(lastFigure, q);
        } else if (recommendation) {
          answer = recommendationAnswer(q, lastFigure);
        } else {
          const result = await searchWikipedia(q);
          answer = result
            ? `<p>No encuentro esa pregunta directamente en el catálogo. Esto puede servir como punto de partida:</p><p><strong>${esc(result.title)}.</strong> ${esc(result.extract)}</p><p>¿Quieres conectarlo con alguna figura de G’IA?</p><p class="assistant-source">Fuente: <a href="${esc(result.url)}" target="_blank" rel="noopener noreferrer">Wikipedia en español</a></p>`
            : `<p>No encontré una respuesta clara. Si me das un nombre, una obra o una idea concreta, seguimos desde ahí.</p>`;
        }
      } catch {
        answer = '<p>No pude consultar una fuente externa ahora mismo. Aun así, podemos seguir explorando las fichas del catálogo.</p>';
      } finally {
        const pending = document.getElementById(pendingId);
        if (pending) pending.outerHTML = message('assistant', answer);
        send.disabled = false;
        transcript.scrollTop = transcript.scrollHeight;
        input.focus();
      }
    }
    scope.on(form, 'submit', (event) => { event.preventDefault(); ask(input.value); });
    return () => scope.cleanup();
  },
};
