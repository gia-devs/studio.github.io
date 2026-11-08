(function (GIA) {
  GIA.aion = GIA.aion || {};
  var KEY = 'gia:aion:conversation';
  var LIMIT = 50;
  var state = { messages: [], lastFigureId: '', lastTemplate: {} };
  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (saved && Array.isArray(saved.messages)) state = {
        messages: saved.messages.filter(function (m) { return m && (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string'; }).slice(-LIMIT),
        lastFigureId: typeof saved.lastFigureId === 'string' ? saved.lastFigureId : '',
        lastTemplate: saved.lastTemplate && typeof saved.lastTemplate === 'object' ? saved.lastTemplate : {}
      };
    } catch (_) { state = { messages: [], lastFigureId: '', lastTemplate: {} }; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} }
  load();
  GIA.aion.memory = {
    get: function () { return state; },
    add: function (role, text, data) { state.messages.push({ role: role, text: String(text || ''), data: data || null, time: Date.now() }); state.messages = state.messages.slice(-LIMIT); save(); },
    setFigure: function (id) { state.lastFigureId = id || ''; save(); },
    setTemplate: function (kind, index) { state.lastTemplate[kind] = index; save(); },
    clear: function () { state = { messages: [], lastFigureId: '', lastTemplate: {} }; save(); },
    limit: LIMIT
  };
})(window.GIA = window.GIA || {});
