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
    var scale = 0.48 + depth * 0.52;
    return {
      x: geom.cx + Math.sin(a) * geom.rx - geom.size / 2,
      y: geom.cy - Math.cos(a) * geom.ry - geom.size / 2 - depth * geom.lift,
      scale: scale,
      opacity: 0.26 + depth * 0.74,
      z: Math.round(depth * 100)
    };
  }

  root.WL = {
    normalizeName: normalizeName,
    hashName: hashName,
    selectedIndex: selectedIndex,
    snapTarget: snapTarget,
    layout: layout
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
