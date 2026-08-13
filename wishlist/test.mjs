import { test } from 'node:test';
import assert from 'node:assert';
import './lib.js';

const { normalizeName, hashName } = globalThis.WL;

test('normalizeName lowercases', () => {
  assert.strictEqual(normalizeName('VITU'), 'vitu');
});

test('normalizeName strips accents', () => {
  assert.strictEqual(normalizeName('Vítu'), 'vitu');
  assert.strictEqual(normalizeName('João'), 'joao');
  assert.strictEqual(normalizeName('Ção'), 'cao');
});

test('normalizeName trims and collapses whitespace', () => {
  assert.strictEqual(normalizeName('  ana   maria '), 'ana maria');
});

test('normalizeName drops punctuation and symbols', () => {
  assert.strictEqual(normalizeName('ana-maria!'), 'anamaria');
  assert.strictEqual(normalizeName('bruno_123'), 'bruno123');
});

test('normalizeName handles non-string and empty input', () => {
  assert.strictEqual(normalizeName(''), '');
  assert.strictEqual(normalizeName(null), '');
  assert.strictEqual(normalizeName(undefined), '');
  assert.strictEqual(normalizeName(42), '');
});

test('normalizeName variants of the same name converge', () => {
  const forms = ['Vitu', '  vitu ', 'VÍTU', 'Vítu'];
  const out = forms.map(normalizeName);
  assert.strictEqual(new Set(out).size, 1, 'all forms should normalize alike');
});

test('hashName is deterministic', () => {
  assert.strictEqual(hashName('vitu'), hashName('vitu'));
});

test('hashName differs across names', () => {
  assert.notStrictEqual(hashName('vitu'), hashName('ana'));
});

test('hashName returns short lowercase hex', () => {
  const h = hashName('vitu');
  assert.match(h, /^[0-9a-f]+$/);
  assert.ok(h.length > 0 && h.length <= 40, 'must fit the Firebase rule limit');
});

test('hashName never leaks the input', () => {
  assert.ok(!hashName('vitu').includes('vitu'));
});

const { selectedIndex, snapTarget, layout, hexToRgba } = globalThis.WL;
const TAU = Math.PI * 2;

test('selectedIndex is 0 at rest', () => {
  assert.strictEqual(selectedIndex(0, 9), 0);
});

test('selectedIndex walks backwards as angle grows', () => {
  const step = TAU / 9;
  assert.strictEqual(selectedIndex(step, 9), 8);
  assert.strictEqual(selectedIndex(2 * step, 9), 7);
});

test('selectedIndex wraps at the 0/TAU seam', () => {
  assert.strictEqual(selectedIndex(TAU, 9), 0);
  assert.strictEqual(selectedIndex(-TAU, 9), 0);
  assert.strictEqual(selectedIndex(10 * TAU, 9), 0);
});

test('selectedIndex is never negative and always in range', () => {
  for (let a = -50; a <= 50; a += 0.37) {
    const i = selectedIndex(a, 9);
    assert.ok(Number.isInteger(i), `not an integer at ${a}`);
    assert.ok(i >= 0 && i < 9, `out of range (${i}) at ${a}`);
  }
});

test('selectedIndex snaps to nearest, not floor', () => {
  const step = TAU / 9;
  assert.strictEqual(selectedIndex(step * 0.49, 9), 0);
  assert.strictEqual(selectedIndex(step * 0.51, 9), 8);
});

test('snapTarget returns a multiple of the step', () => {
  const step = TAU / 9;
  const t = snapTarget(step * 2.3, 9);
  assert.ok(Math.abs(t / step - Math.round(t / step)) < 1e-9);
});

test('snapTarget takes the shortest path, never spinning the long way', () => {
  const step = TAU / 9;
  for (const a of [0.1, -0.1, step * 4.4, -step * 7.7, TAU * 3 + 0.2]) {
    assert.ok(Math.abs(snapTarget(a, 9) - a) <= step / 2 + 1e-9,
      `moved more than half a step from ${a}`);
  }
});

test('snapTarget is a fixed point on an already-snapped angle', () => {
  const step = TAU / 9;
  assert.ok(Math.abs(snapTarget(step * 3, 9) - step * 3) < 1e-9);
});

test('snapTarget agrees with selectedIndex', () => {
  for (let a = -20; a <= 20; a += 0.23) {
    assert.strictEqual(selectedIndex(snapTarget(a, 9), 9), selectedIndex(a, 9),
      `snapping changed the selection at ${a}`);
  }
});

test('layout puts the selected item front and centre', () => {
  const g = { cx: 150, cy: 140, rx: 98, ry: 44, size: 82, lift: 24 };
  const l = layout(0, 0, 9, g);
  assert.ok(Math.abs(l.x - (g.cx - g.size / 2)) < 1e-6);
  assert.strictEqual(l.scale, 1);
  assert.strictEqual(l.opacity, 1);
});

test('layout scales and fades items toward the back', () => {
  const g = { cx: 150, cy: 140, rx: 98, ry: 44, size: 82, lift: 24 };
  const front = layout(0, 0, 9, g);
  const back = layout(Math.PI, 0, 9, g);
  assert.ok(back.scale < front.scale);
  assert.ok(back.opacity < front.opacity);
  assert.ok(back.z < front.z);
});

test('layout keeps scale and opacity within sane bounds', () => {
  const g = { cx: 150, cy: 140, rx: 98, ry: 44, size: 82, lift: 24 };
  for (let a = -10; a <= 10; a += 0.11) {
    for (let i = 0; i < 9; i++) {
      const l = layout(a, i, 9, g);
      assert.ok(l.scale > 0 && l.scale <= 1, `scale ${l.scale}`);
      assert.ok(l.opacity > 0 && l.opacity <= 1, `opacity ${l.opacity}`);
      assert.ok(Number.isFinite(l.x) && Number.isFinite(l.y));
    }
  }
});

test('layout gives the focused item a clear size lead', () => {
  const g = { cx: 150, cy: 140, rx: 98, ry: 44, size: 82, lift: 24 };
  const front = layout(0, 0, 9, g).scale;
  const mid = layout(Math.PI / 2, 0, 9, g).scale;   // depth 0.5
  // curva convexa: o do meio fica bem abaixo do ponto médio linear (0.70),
  // senão o item em foco não se destaca dos vizinhos
  assert.strictEqual(front, 1);
  assert.ok(mid < 0.66, `meio deveria encolher mais que o linear, veio ${mid}`);
});

test('layout exposes depth so callers can drive focus effects', () => {
  const g = { cx: 150, cy: 140, rx: 98, ry: 44, size: 82, lift: 24 };
  assert.strictEqual(layout(0, 0, 9, g).depth, 1);                    // frente
  assert.ok(Math.abs(layout(Math.PI, 0, 9, g).depth) < 1e-9);         // fundo
  assert.ok(Math.abs(layout(Math.PI / 2, 0, 9, g).depth - 0.5) < 1e-9); // lado
});

test('layout depth stays in 0..1 all the way around', () => {
  const g = { cx: 150, cy: 140, rx: 98, ry: 44, size: 82, lift: 24 };
  for (let a = -10; a <= 10; a += 0.07) {
    const d = layout(a, 3, 9, g).depth;
    assert.ok(d >= 0 && d <= 1, `depth fora de faixa: ${d}`);
  }
});

test('hexToRgba converts 6-digit hex', () => {
  assert.strictEqual(hexToRgba('#5289c6', 0.14), 'rgba(82,137,198,0.14)');
});

test('hexToRgba accepts no-hash and 3-digit forms', () => {
  assert.strictEqual(hexToRgba('5289c6', 1), 'rgba(82,137,198,1)');
  assert.strictEqual(hexToRgba('#abc', 0.5), 'rgba(170,187,204,0.5)');
});

test('hexToRgba is case insensitive', () => {
  assert.strictEqual(hexToRgba('#5289C6', 0.14), hexToRgba('#5289c6', 0.14));
});

test('hexToRgba returns null on garbage so callers can fall back', () => {
  for (const bad of ['', null, undefined, 'azul', '#12', '#1234567', 42]) {
    assert.strictEqual(hexToRgba(bad, 0.5), null, `deveria rejeitar ${bad}`);
  }
});

test('geometry survives a single-item list', () => {
  const g = { cx: 150, cy: 140, rx: 98, ry: 44, size: 82, lift: 24 };
  assert.strictEqual(selectedIndex(0, 1), 0);
  assert.ok(Number.isFinite(snapTarget(1.234, 1)));
  assert.ok(Number.isFinite(layout(0, 0, 1, g).x));
});
