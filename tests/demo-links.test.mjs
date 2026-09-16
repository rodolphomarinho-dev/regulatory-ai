import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { modes } from '../site/demo-engine.mjs';
import { demoHash, demoFromHash } from '../site/demo-links.mjs';
const html = await readFile(new URL('../site/index.html', import.meta.url), 'utf8');
for (const kind of Object.keys(modes)) test(`shareable demo: ${kind}`, () => {
  const hash = demoHash(kind);
  assert.equal(demoFromHash(hash), kind);
  assert.ok(html.includes(`id="${hash.slice(1)}"`));
  assert.ok(html.includes(`href="${hash}" data-open-demo="${kind}"`));
});
test('unknown and ordinary page fragments do not select a demonstration', () => {
  for (const hash of ['', '#', '#about', '#lab', '#demo-unknown', '#demo-__proto__']) assert.equal(demoFromHash(hash), null);
  assert.throws(() => demoHash('unknown'));
});
