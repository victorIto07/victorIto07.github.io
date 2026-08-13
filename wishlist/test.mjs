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
