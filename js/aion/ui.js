(function (GIA) {
  GIA.aion = GIA.aion || {};
  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = String(text);
    return node;
  }
  function renderMessage(list, message) {
    var article = element('article', 'assistant-message assistant-message--' + message.role);
    var avatar = element('div', 'assistant-message__avatar', message.role === 'assistant' ? 'A' : 'Tú');
    if (message.role === 'assistant') { avatar.title = 'Aion'; avatar.setAttribute('aria-label', 'Aion'); }
    var body = element('div', 'assistant-message__body');
    body.appendChild(element('p', '', message.text));
    if (message.links && message.links.length) {
      var links = element('div', 'assistant-links');
      message.links.forEach(function (item) { if (!/^#\/figura\/[a-z0-9-]+$/.test(item.href || '')) return; var a = element('a', 'btn btn--secondary btn--sm', item.texto); a.href = item.href; links.appendChild(a); });
      body.appendChild(links);
    }
    if (message.sugerencias && message.sugerencias.length) {
      var suggestions = element('div', 'assistant-suggestions');
      message.sugerencias.slice(0, 3).forEach(function (prompt) { var b = element('button', 'chip', prompt); b.type = 'button'; b.setAttribute('data-aion-prompt', prompt); suggestions.appendChild(b); });
      body.appendChild(suggestions);
    }
    article.appendChild(avatar); article.appendChild(body); list.appendChild(article);
  }
  function mount(root, context) {
    var panel = root.querySelector('[data-transcript]');
    var form = root.querySelector('[data-form]');
    if (!panel || !form) return function () {};
    var input = form.elements.question;
    var send = form.querySelector('[type="submit"]');
    var scope = [];
    var memory = GIA.aion.memory;
    var busy = false;
    var priorContext = context && context.figureId;
    if (priorContext) memory.setFigure(priorContext);
    function listen(target, type, handler) { target.addEventListener(type, handler); scope.push(function () { target.removeEventListener(type, handler); }); }
    function paint() {
      panel.replaceChildren();
      memory.get().messages.slice(-50).forEach(function (m) { renderMessage(panel, { role: m.role, text: m.text, links: m.data && m.data.enlaces, sugerencias: m.data && m.data.sugerencias }); });
      panel.scrollTop = panel.scrollHeight;
    }
    function greeting() { memory.add('assistant', 'Hola, soy Aion.', { sugerencias: ['¿Por dónde empiezo?', 'Sorpréndeme', 'Dame una frase de Descartes'] }); }
    function clear() { memory.clear(); greeting(); paint(); }
    async function ask(raw) {
      var text = String(raw || '').trim(); if (!text || busy) return;
      busy = true;
      memory.add('user', text); renderMessage(panel, { role: 'user', text: text });
      input.value = ''; send.disabled = true; panel.scrollTop = panel.scrollHeight;
      var pending = element('article', 'assistant-message assistant-message--assistant');
      pending.appendChild(element('div', 'assistant-message__avatar', 'A')); pending.appendChild(element('div', 'assistant-message__body', 'Aion está pensando…')); panel.appendChild(pending);
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var delay = reduce ? 0 : 400 + Math.floor(Math.random() * 501);
      var started = Date.now();
      try {
        var response = await GIA.aion.Aion.respond(text, { figureId: memory.get().lastFigureId || priorContext });
        var remaining = Math.max(0, delay - (Date.now() - started));
        if (remaining) await new Promise(function (resolve) { setTimeout(resolve, remaining); });
        pending.remove();
        memory.add('assistant', response.texto, response);
        renderMessage(panel, { role: 'assistant', text: response.texto, links: response.enlaces, sugerencias: response.sugerencias });
      } catch (_) {
        pending.remove(); var fallback = 'No tengo una respuesta para eso todavía. ¿Probamos con una figura o una obra?';
        memory.add('assistant', fallback); renderMessage(panel, { role: 'assistant', text: fallback });
      } finally { busy = false; updateSend(); panel.scrollTop = panel.scrollHeight; input.focus(); }
    }
    function updateSend() { send.disabled = busy || !input.value.trim(); }
    listen(form, 'submit', function (event) { event.preventDefault(); ask(input.value); });
    listen(input, 'input', updateSend);
    listen(input, 'keydown', function (event) { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); } });
    listen(root, 'click', function (event) {
      var prompt = event.target.closest('[data-aion-prompt]'); if (prompt) ask(prompt.getAttribute('data-aion-prompt'));
      if (event.target.closest('[data-aion-clear]')) clear();
    });
    if (!memory.get().messages.length) greeting();
    paint(); updateSend();
    return function () { scope.forEach(function (off) { off(); }); };
  }
  GIA.aion.ui = { mount: mount, renderMessage: renderMessage };
})(window.GIA = window.GIA || {});
