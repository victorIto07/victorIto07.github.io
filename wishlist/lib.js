/* Pure helpers. No DOM, no network. Loads as a browser <script> and as
   CommonJS under Node — do not add `export` statements. */
(function (root) {
  'use strict';

  function normalizeName(raw) {
    if (typeof raw !== 'string') return '';
    return raw
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')   // combining diacritics
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* cyrb53 — deterministic ~53-bit string hash.
     Deliberately not crypto.subtle: that needs a secure context and is
     unavailable over file://, which would make local previews produce
     different identities than the deployed page. Hash strength is
     irrelevant here anyway — the input space is a few dozen first names. */
  function hashName(str) {
    var s = typeof str === 'string' ? str : '';
    var h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (var i = 0; i < s.length; i++) {
      var ch = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    var n = 4294967296 * (2097151 & h2) + (h1 >>> 0);
    return n.toString(16);
  }

  var TAU = Math.PI * 2;

  function selectedIndex(angle, count) {
    var step = TAU / count;
    var i = Math.round(-angle / step) % count;
    return (i + count) % count;
  }

  function snapTarget(angle, count) {
    var step = TAU / count;
    return Math.round(angle / step) * step;
  }

  function layout(angle, i, count, geom) {
    var a = angle + i * (TAU / count);
    var depth = (Math.cos(a) + 1) / 2;
    /* Curva convexa (expoente > 1) em vez de linear: derruba os vizinhos mais
       rápido do que a distância sugere, então o item em foco fica destacado.
       Linear deixava todo mundo com tamanho parecido perto da frente. */
    var scale = 0.40 + 0.60 * Math.pow(depth, 1.5);
    return {
      x: geom.cx + Math.sin(a) * geom.rx - geom.size / 2,
      y: geom.cy - Math.cos(a) * geom.ry - geom.size / 2 - depth * geom.lift,
      scale: scale,
      opacity: 0.26 + depth * 0.74,
      z: Math.round(depth * 100),
      depth: depth        // 0 = fundo, 1 = em foco; move o brilho do tile
    };
  }

  /* Converte a cor do item pra rgba com alpha, pro efeito de vidro da ficha.
     Devolve null em entrada inválida pra quem chama poder cair num padrão. */
  function hexToRgba(hex, alpha) {
    if (typeof hex !== 'string') return null;
    var h = hex.trim().replace(/^#/, '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    return 'rgba(' + parseInt(h.slice(0, 2), 16) + ',' +
                     parseInt(h.slice(2, 4), 16) + ',' +
                     parseInt(h.slice(4, 6), 16) + ',' + alpha + ')';
  }

  root.WL = {
    normalizeName: normalizeName,
    hashName: hashName,
    selectedIndex: selectedIndex,
    snapTarget: snapTarget,
    layout: layout,
    hexToRgba: hexToRgba
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
