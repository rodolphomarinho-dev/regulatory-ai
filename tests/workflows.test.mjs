import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { modes, runScenario, toCSV, toMarkdown } from '../site/demo-engine.mjs';
const fixtures = JSON.parse(await readFile(new URL('../site/examples/eval-cases.json', import.meta.url), 'utf8'));
for (const fixture of fixtures.cases) test(`fixture: ${fixture.id}`, () => {
  const r = runScenario(fixture.kind, fixture.settings);
  assert.equal(r.machineGate, fixture.expect.machineGate);
  assert.equal(r.contract, fixture.expect.contract);
  assert.equal(r.items[0].id, fixture.expect.itemId);
});
function permutations(fields) {
  return fields.reduce((sets, f) => sets.flatMap(set => f.options.map(([value]) => ({ ...set, [f.id]: value }))), [{}]);
}
for (const [kind, config] of Object.entries(modes)) {
  for (const settings of permutations(config.fields)) test(`invariants: ${kind} ${JSON.stringify(settings)}`, () => {
    const r = runScenario(kind, settings);
    assert.equal(r.synthetic, true);
    assert.equal(r.liveModelCalled, false);
    assert.equal(r.execution, 'deterministic-fixture');
    assert.equal(r.humanDecision, 'not-provided');
    assert.equal(r.releaseStatus, 'not-authorized');
    assert.ok(r.question && r.title && r.contract);
    const ids = r.sources.map(s => s.id);
    assert.equal(new Set(ids).size, ids.length);
    r.items.forEach(i => { assert.ok(i.sourceRefs.length); i.sourceRefs.forEach(id => assert.ok(ids.includes(id))); });
    assert.ok(toCSV(r).includes('not-authorized'));
    assert.ok(toMarkdown(r).includes('Synthetic demonstration'));
  });
}
test('Pre-Submission outputs do not invent deficiency findings', () => {
  for (const evidence of ['missing', 'complete']) {
    const r = runScenario('submission', { mode: 'presub', evidence });
    assert.doesNotMatch(JSON.stringify(r), /deficiency|approval probability/i);
    assert.equal(r.evaluationPlan.measuredModelPerformance, null);
  }
});
test('blocked source gates prevent specialist execution', () => {
  for (const packet of ['missing', 'conflict']) {
    const r = runScenario('orchestration', { packet });
    assert.equal(r.trace[1].state, 'stopped');
    assert.equal(r.trace[2].state, 'held');
    assert.match(r.trace[2].detail, /Not executed/);
  }
});
test('complete sources do not authorize release', () => {
  const r = runScenario('orchestration', { packet: 'complete' });
  assert.equal(r.trace[3].state, 'passed');
  assert.equal(r.trace[4].state, 'held');
  assert.equal(r.releaseStatus, 'not-authorized');
});
test('invalid values and unknown demos are rejected', () => {
  assert.throws(() => runScenario('made-up'));
  assert.throws(() => runScenario('__proto__'));
  assert.throws(() => runScenario('audit', { evidence: '<script>' }));
});
test('CSV export quotes delimiters and neutralizes spreadsheet formulas', () => {
  const r = runScenario('audit');
  r.items[0].title = '=HYPERLINK("x","y")';
  assert.ok(toCSV(r).includes('"\'=HYPERLINK(""x"",""y"")"'));
});
test('missing packet evidence does not assert missing real-world activity', () => {
  const r = runScenario('audit', { evidence: 'missing' });
  assert.match(r.items[0].detail, /does not mean the activity was never performed/);
});
