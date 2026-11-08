(function (GIA) {
GIA.components = GIA.components || {};
GIA.components.icons = GIA.components.icons || {};
// Iconos SVG en línea (24x24, trazo).

const P = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  sparkle: '<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z"/><path d="M18.5 16.5v3M17 18h3"/>',
  user: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20c.8-3.8 3.8-5.8 7.5-5.8s6.7 2 7.5 5.8"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10C19.5 15.4 12 20 12 20z"/>',
  star: '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8z"/>',
  chevronLeft: '<path d="m14.5 5-7 7 7 7"/>',
  chevronRight: '<path d="m9.5 5 7 7-7 7"/>',
  chevronDown: '<path d="m5 9.5 7 7 7-7"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  play: '<path d="M8 5.5v13l11-6.5z"/>',
  pause: '<path d="M8.5 5v14M15.5 5v14"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.01"/>',
  alert: '<path d="M12 4 3.5 19h17z"/><path d="M12 10v4.5M12 17v.01"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  book: '<path d="M4 5h7a2 2 0 0 1 2 2v12a1.5 1.5 0 0 0-1.5-1.5H4z"/><path d="M20 5h-7a2 2 0 0 0-2 2v12a1.5 1.5 0 0 1 1.5-1.5H20z"/>',
  palette: '<circle cx="12" cy="12" r="8.5"/><circle cx="9" cy="10" r="1.2"/><circle cx="14" cy="9" r="1.2"/><circle cx="15.5" cy="13" r="1.2"/><circle cx="11" cy="14.5" r="1.2"/>',
  logout: '<path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9"/>',
  trash: '<path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"/>',
  settings: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.6M20 5v6h-6"/>',
  quote: '<path d="M7 11c0-2 1.5-3.5 3.5-3.5S14 9 14 11v3c0 1.5-1 2.5-2.5 2.5S9 15.5 9 14"/><path d="M15 11c0-2 1.5-3.5 3.5-3.5S22 9 22 11v3c0 1.5-1 2.5-2.5 2.5S17 15.5 17 14"/>',
};

function icon(name, { size = 20, cls = '', label = '' } = {}) {
  const body = P[name] || P.info;
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
  return `<svg class="icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ${a11y}>${body}</svg>`;
}


Object.assign(GIA.components.icons, { icon });
})(window.GIA = window.GIA || {});
