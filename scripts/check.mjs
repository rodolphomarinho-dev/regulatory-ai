import { readFile, stat, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const html = await readFile(path.join(root, 'site/index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate HTML IDs');
for (const [, ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  if (/^https?:/.test(ref)) continue;
  if (ref.startsWith('#')) { if (ref.length > 1 && !ids.includes(ref.slice(1))) throw new Error(`Missing anchor ${ref}`); continue; }
  await stat(path.join(root, 'site', ref));
}
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(target);
    else {
      const text = await readFile(target, 'utf8');
      const forbidden = [/C:[\\/]Users[\\/]/i, /@roche\.com/i, /flexdev\.roche\.com/i, /veevavault\.com/i, /Julian Gautschi/i, /Petra Hoffmann/i, /incoming data scientist/i];
      if (target.endsWith('check.mjs')) continue;
      for (const pattern of forbidden) if (pattern.test(text)) throw new Error(`Public package needs review: ${path.relative(root, target)}`);
    }
  }
}
await walk(root);
console.log('PASS: local links, unique IDs and scoped public-package content checks. Not a confidentiality certification.');
