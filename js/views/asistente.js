// Asistente de exploración: combina las fichas locales con búsquedas en Wikipedia en español.

import { createScope, esc } from '../core/utils.js';
import { FIGURES, TYPE_LABELS, fmtYears } from '../data/figures.js';
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

function findFigure(question) {
  const q = normalize(question);
  return FIGURES.find((f) => [f.name, f.id.replaceAll('-', ' '), ...f.works].some((term) => {
    const n = normalize(term);
    return n.length > 3 && q.includes(n);
  }));
}

function message(role, html) {
  return `<article class="assistant-message assistant-message--${role}"><div class="assistant-message__avatar"${role === 'assistant' ? ' title="Aion" aria-label="Aion"' : ''}>${role === 'assistant' ? 'A' : 'Tú'}</div><div class="assistant-message__body">${html}</div></article>`;
}

export default {
  title: 'Aion',
  render() {
    return `<div class="page assistant-page">
      <header class="page-head"><p class="eyebrow">Aion · El guardián cósmico de la creatividad y el conocimiento</p><h1>Aion</h1><p>El espacio donde conversas y exploras ideas, artistas y pensamiento.</p></header>
      <section class="assistant-panel" aria-label="Conversación con Aion">
        <div class="assistant-transcript" data-transcript aria-live="polite">${message('assistant', '<p>Hola, soy Aion. Te acompaño a explorar las ideas y obras de G’IA.</p><p class="assistant-note">Aion consulta las fichas de la plataforma y, cuando hace falta más contexto, busca en Wikipedia en español y enlaza la fuente.</p>')}</div>
        <div class="assistant-suggestions"><button type="button" data-prompt="¿Quién fue Frida Kahlo?">¿Quién fue Frida Kahlo?</button><button type="button" data-prompt="Háblame de Sócrates">Háblame de Sócrates</button><button type="button" data-prompt="¿Qué obras hizo Leonardo da Vinci?">Obras de Leonardo da Vinci</button></div>
        <form class="assistant-form" data-form><label class="sr-only" for="assistant-input">Escribe tu pregunta</label><textarea id="assistant-input" name="question" rows="1" maxlength="500" placeholder="Pregunta sobre una figura…" required></textarea><button class="btn btn--primary assistant-send" type="submit" aria-label="Enviar pregunta">${icon('arrowRight', { size: 19 })}</button></form>
        <p class="assistant-disclaimer">Si la pregunta no coincide con una figura del catálogo, su texto se envía a Wikipedia en español para buscar un artículo.</p>
      </section>
    </div>`;
  },
  mount(root) {
    const scope = createScope();
    const transcript = root.querySelector('[data-transcript]');
    const form = root.querySelector('[data-form]');
    const input = form.elements.question;
    const send = form.querySelector('button[type=submit]');
    async function ask(raw) {
      const q = raw.trim();
      if (!q) return;
      transcript.insertAdjacentHTML('beforeend', message('user', `<p>${esc(q)}</p>`));
      const pendingId = `assistant-pending-${Date.now()}`;
      transcript.insertAdjacentHTML('beforeend', `<div id="${pendingId}">${message('assistant', '<p>Buscando…</p>')}</div>`);
      send.disabled = true;
      input.value = '';
      transcript.scrollTop = transcript.scrollHeight;
      let answer;
      try {
        const figure = findFigure(q);
        if (figure) {
          answer = `<p><strong><a href="#/figura/${figure.id}">${esc(figure.name)}</a></strong> es ${esc(TYPE_LABELS[figure.type].toLowerCase())} (${esc(fmtYears(figure.years))}). ${esc(figure.bio)}</p><p><strong>Obras:</strong> ${esc(figure.works.slice(0, 3).join(' · '))}</p><p class="assistant-source">Fuente: catálogo de G’IA · <a href="#/figura/${figure.id}">Abrir ficha</a></p>`;
        } else {
          const result = await searchWikipedia(q);
          answer = result
            ? `<p><strong>${esc(result.title)}.</strong> ${esc(result.extract)}</p><p class="assistant-source">Fuente: <a href="${esc(result.url)}" target="_blank" rel="noopener noreferrer">Wikipedia en español</a></p>`
            : `<p>No encontré un artículo claro para esa pregunta. Prueba con un nombre o concepto más concreto.</p>`;
        }
      } catch {
        answer = '<p>No pude consultar Wikipedia en este momento. Revisa tu conexión e inténtalo de nuevo.</p>';
      } finally {
        const pending = document.getElementById(pendingId);
        if (pending) pending.outerHTML = message('assistant', answer);
        send.disabled = false;
        transcript.scrollTop = transcript.scrollHeight;
        input.focus();
      }
    }
    scope.on(form, 'submit', (event) => { event.preventDefault(); ask(input.value); });
    scope.on(root, 'click', (event) => { const b = event.target.closest('[data-prompt]'); if (b) ask(b.dataset.prompt); });
    return () => scope.cleanup();
  },
};
