import test from 'node:test';
import assert from 'node:assert/strict';
import { runScenario, toCSV, toMarkdown } from '../site/demo-engine.mjs';
import { exploreReviewPath } from '../site/eval-workflow.mjs';

const cases = ['clear', 'machinery', 'uncertain'];
const packets = ['complete', 'missing', 'conflict'];
const paths = ['revise', 'exclude', 'request'];
const scenario = (evalCase, packet = 'complete') => runScenario('orchestration', { packet, evalCase });
const layer = (result, number) => result.evaluations.find(entry => entry.layer === number);
const step = (result, name) => result.trace.find(entry => entry.step === name);

function assertBoundaries(result) {
  assert.equal(result.synthetic, true);
  assert.equal(result.execution, 'deterministic-fixture');
  assert.equal(result.liveModelCalled, false);
  assert.equal(result.evaluator.liveCall, false);
  assert.equal(result.evaluator.measuredPerformance, null);
  assert.equal(result.humanDecision, 'not-provided');
  assert.equal(result.releaseStatus, 'not-authorized');
  assert.equal(layer(result, 5).state, 'held');
  assert.match(result.evaluator.design, /Jev.*layers 3 and 4/);
  assert.match(result.evaluator.execution, /scripted demonstration, not a Jev response/);
  const sourceIds = result.sources.map(source => source.id);
  assert.equal(new Set(sourceIds).size, sourceIds.length);
  assert.ok(result.sources.every(source => source.classification === 'synthetic'));
  for (const item of result.items) {
    assert.ok(item.sourceRefs.length > 0);
    for (const id of item.sourceRefs) assert.ok(sourceIds.includes(id), `Missing source ${id}`);
  }
}

function freeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

// Read exported cell values independently of column positions, including escaped quotes.
function csvRows(csv) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let index = 0; index < csv.length; index++) {
    const character = csv[index];
    if (character === '"') {
      if (quoted && csv[index + 1] === '"') { cell += '"'; index++; }
      else quoted = !quoted;
    } else if (character === ',' && !quoted) { row.push(cell); cell = ''; }
    else if (character === '\n' && !quoted) {
      row.push(cell.replace(/\r$/, ''));
      rows.push(row);
      row = []; cell = '';
    } else cell += character;
  }
  assert.equal(quoted, false, 'CSV has balanced quoting');
  if (cell || row.length) rows.push([...row, cell]);
  const [columns, ...data] = rows;
  return data.map(values => {
    assert.equal(values.length, columns.length, 'Each CSV record matches its header');
    return Object.fromEntries(columns.map((column, index) => [column, values[index]]));
  });
}

for (const packet of packets) for (const evalCase of cases) {
  test(`five evaluation layers respect source gate: ${packet}/${evalCase}`, () => {
    const result = scenario(evalCase, packet);
    assertBoundaries(result);
    assert.deepEqual(result.evaluations.map(({ layer, name }) => [layer, name]), [
      [1, 'Components'], [2, 'Trajectory'], [3, 'Outcome'],
      [4, 'System monitoring'], [5, 'Human regulatory review']
    ]);
    if (packet !== 'complete') {
      assert.equal(result.machineGate, 'blocked');
      assert.equal(layer(result, 1).state, 'stopped');
      for (const number of [2, 3, 4]) assert.equal(layer(result, number).state, 'held');
      assert.equal(step(result, 'Specialist roles').state, 'held');
      assert.equal(step(result, 'Output contract').state, 'held');
      assert.equal(result.escalation, undefined);
      assert.equal(result.reviewOptions, undefined);
      assert.equal(result.events?.length ?? 0, 0);
    } else {
      assert.equal(layer(result, 1).state, 'passed');
      assert.equal(layer(result, 2).state, 'passed');
      assert.equal(result.machineGate, evalCase === 'clear' ? 'passed-for-review' : 'blocked');
      assert.equal(layer(result, 3).state, { clear: 'passed', machinery: 'flagged', uncertain: 'uncertain' }[evalCase]);
      assert.equal(layer(result, 4).state, evalCase === 'clear' ? 'passed' : 'alerted');
      if (evalCase === 'clear') {
        assert.equal(result.escalation, undefined);
        assert.equal(result.reviewOptions, undefined);
      }
    }
  });
}

for (const evalCase of ['machinery', 'uncertain']) {
  test(`material signal pauses the draft and alerts the main agent: ${evalCase}`, () => {
    const result = scenario(evalCase);
    const issue = result.escalation;
    assert.equal(issue.id, 'EVAL-01');
    assert.equal(issue.recipient, 'Main agent');
    assert.equal(issue.owner, 'Rodolpho + Regulatory team');
    assert.equal(issue.outcomeSignal, evalCase === 'machinery' ? 'evidence_mismatch' : 'insufficient_context');
    assert.equal(issue.monitoringSignal, 'review_required');
    assert.equal(issue.action, 'pause_affected_deliverable');
    assert.equal(issue.delivery, 'simulated-local-event-only');
    assert.deepEqual(issue.sourceRefs, ['MAP-01', 'SCOPE-01']);
    assert.equal(step(result, 'Output contract').state, 'held');
    assert.ok(result.events.some(event => event.kind === 'eval.alert' && event.to === 'main-agent' && event.issue === issue.id && event.disposition === 'paused'));
    assert.deepEqual(result.reviewOptions, paths);
  });

  for (const path of paths) {
    test(`review branch preserves the original issue and requires real review: ${evalCase}/${path}`, () => {
      const original = freeze(scenario(evalCase));
      const snapshot = structuredClone(original);
      const result = exploreReviewPath(original, path);
      const rerun = path !== 'request';
      assert.deepEqual(original, snapshot, 'Exploration must not mutate its input');
      assert.notEqual(result, original);
      assert.deepEqual(result.settings, original.settings);
      assertBoundaries(result);
      assert.equal(result.reviewSimulation.path, path);
      assert.equal(result.reviewSimulation.actualHumanApproval, false);
      assert.deepEqual(result.originalIssue, original.escalation);
      assert.notEqual(result.originalIssue, original.escalation);
      assert.deepEqual(result.events.slice(0, original.events.length), original.events);
      assert.deepEqual(result.trace.slice(0, original.trace.length), original.trace);
      assert.equal(new Set(result.events.map(event => event.id)).size, result.events.length);
      assert.ok(result.events.some(event => event.kind === 'review.path.simulated' && event.disposition === path));
      assert.ok(result.events.some(event => event.kind === (rerun ? 'fixture.rechecked' : 'source.request.pending')));
      for (const source of original.sources) assert.deepEqual(result.sources.find(item => item.id === source.id), source);
      assert.equal(result.machineGate, rerun ? 'passed-for-review' : 'blocked');
      assert.equal(result.items[0].priority, rerun ? 'Final human review required' : 'Blocks the affected draft');
      assert.equal(layer(result, 3).state, rerun ? 'passed' : 'held');
      assert.equal(layer(result, 4).state, rerun ? 'recorded' : 'alerted');
      assert.equal(step(result, 'Output contract · recheck').state, rerun ? 'passed' : 'held');
      assert.equal(step(result, 'Final human review').state, 'held');
      assert.equal(result.escalation.resolution, rerun ? 'resolved-in-hypothetical-fixture-only' : 'unresolved');
      assert.equal(result.sources.some(source => source.id === 'MAP-02'), rerun);
      if (rerun) assert.equal(result.regressionCandidate.status, 'illustrative-candidate');
      else assert.equal(result.regressionCandidate, null);
      if (path === 'exclude') assert.match(result.sources.find(source => source.id === 'MAP-02').text, /retained as not applicable/);
      for (const secondPath of paths) assert.throws(() => exploreReviewPath(result, secondPath), /Rerun the original scenario/);
    });

    test(`JSON, CSV and Markdown retain evaluation and review evidence: ${evalCase}/${path}`, () => {
      const result = exploreReviewPath(scenario(evalCase), path);
      const json = JSON.parse(JSON.stringify(result));
      for (const key of ['evaluations', 'evaluator', 'escalation', 'originalIssue', 'reviewSimulation', 'events', 'sources', 'trace']) assert.deepEqual(json[key], result[key]);
      assertBoundaries(json);
      const records = csvRows(toCSV(result));
      for (const checkpoint of result.evaluations) {
        const row = records.find(record => record.record_type === 'checkpoint' && record.id === `L${checkpoint.layer}`);
        assert.ok(row, `CSV retains layer ${checkpoint.layer}`);
        assert.equal(row.state, checkpoint.state);
        assert.equal(row.detail, checkpoint.detail);
      }
      assert.ok(records.some(record => record.record_type === 'hypothetical-review' && record.review_path === path && record.state === 'not-real-approval'));
      assert.ok(records.every(record => record.release_status === 'not-authorized'));
      for (const event of result.events) assert.ok(records.some(record => record.detail === JSON.stringify(event)), `CSV retains ${event.id}`);
      assert.ok(records.some(record => record.detail === JSON.stringify(result.originalIssue)), 'CSV retains original issue before the hypothetical disposition');
      const markdown = toMarkdown(result);
      assert.match(markdown, /Synthetic demonstration/);
      assert.match(markdown, /Release: not-authorized/);
      assert.match(markdown, /No real approval/);
      for (const checkpoint of result.evaluations) assert.ok(markdown.includes(checkpoint.detail));
      assert.ok(markdown.includes(result.reviewSimulation.rationale));
      assert.ok(markdown.includes(result.reviewSimulation.next));
      assert.ok(markdown.includes(result.originalIssue.action), 'Markdown retains the original pause');
      for (const event of result.events) {
        assert.ok(markdown.includes(event.id), `Markdown retains ${event.id}`);
        assert.ok(markdown.includes(event.kind), `Markdown retains ${event.kind}`);
      }
    });
  }
}

test('only unresolved eligible evaluation scenarios offer review transitions', () => {
  const ineligible = [runScenario('audit'), runScenario('submission'), scenario('clear')];
  for (const packet of ['missing', 'conflict']) for (const evalCase of cases) ineligible.push(scenario(evalCase, packet));
  for (const result of ineligible) for (const path of paths) assert.throws(() => exploreReviewPath(result, path), /No eligible review path/);
  for (const path of ['approve', 'release', '__proto__', 'constructor', '', null, undefined]) assert.throws(() => exploreReviewPath(scenario('machinery'), path), /No eligible review path/);
  for (const evalCase of ['approve', '__proto__', 1]) assert.throws(() => scenario(evalCase), /Invalid evalCase/);
});
