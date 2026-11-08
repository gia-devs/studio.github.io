(function (GIA) {
  GIA.aion = GIA.aion || {};
  function normalize(value) {
    return String(value == null ? '' : value)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function distance(a, b, limit) {
    a = normalize(a); b = normalize(b);
    if (Math.abs(a.length - b.length) > limit) return limit + 1;
    var prev = Array.from({ length: b.length + 1 }, function (_, i) { return i; });
    for (var i = 1; i <= a.length; i++) {
      var row = [i], min = i;
      for (var j = 1; j <= b.length; j++) {
        var value = Math.min(row[j - 1] + 1, prev[j] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        row[j] = value; if (value < min) min = value;
      }
      if (min > limit) return limit + 1;
      prev = row;
    }
    return prev[b.length];
  }
  function matches(candidate, term) {
    var a = normalize(candidate), b = normalize(term);
    if (!a || !b) return false;
    if (a === b || a.indexOf(b) >= 0 || b.indexOf(a) >= 0) return true;
    var words = a.split(/\s+/);
    if (words.some(function (word) { return Math.min(word.length, b.length) >= 5 && distance(word, b, 2) <= 2; })) return true;
    var termWords = b.split(/\s+/);
    if (termWords.some(function (word) { return Math.min(word.length, a.length) >= 5 && distance(a, word, 2) <= 2; })) return true;
    return Math.min(a.length, b.length) >= 5 && distance(a, b, 2) <= 2;
  }
  GIA.aion.normalize = normalize;
  GIA.aion.distance = distance;
  GIA.aion.matches = matches;
})(window.GIA = window.GIA || {});
