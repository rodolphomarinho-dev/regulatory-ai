import { modes } from './demo-engine.mjs';

export function demoHash(kind) {
  if (!Object.hasOwn(modes, kind)) throw new Error('Unknown demonstration');
  return `#demo-${kind}`;
}

export function demoFromHash(hash) {
  return Object.keys(modes).find(kind => demoHash(kind) === hash) ?? null;
}
