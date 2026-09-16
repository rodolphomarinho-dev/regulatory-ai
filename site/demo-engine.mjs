// Public teaching examples, rebuilt from scratch. No company data or live AI.
export const modes = Object.freeze({
  audit: {
    title: 'Audit simulation',
    description: 'Change the evidence behind a CAPA. Watch the challenge change — without pretending a hypothesis is an audit finding.',
    fields: [
      { id: 'evidence', label: 'Evidence packet', options: [['missing', 'Missing effectiveness evidence'], ['conflict', 'Conflicting effectiveness records'], ['complete', 'Traceable effectiveness evidence']] },
      { id: 'focus', label: 'Auditor’s focus', options: [['capa', 'CAPA effectiveness'], ['data', 'Data integrity and traceability']] }
    ]
  },
  submission: {
    title: 'Submission rehearsal',
    description: 'The same fictional assay. Two different intended uses. The output contract changes before the simulation starts.',
    fields: [
      { id: 'mode', label: 'Simulation contract', options: [['presub', 'Pre-Submission: rehearse a question'], ['submission', 'Submission: challenge the evidence']] },
      { id: 'evidence', label: 'Evidence packet', options: [['missing', 'Claim exceeds study coverage'], ['complete', 'Claim matches documented coverage']] }
    ]
  },
  orchestration: {
    title: 'Orchestration layers',
    description: 'Inspect the handoffs. A useful orchestration layer knows when to run, when to stop and what a human still needs to decide.',
    fields: [
      { id: 'packet', label: 'Input condition', options: [['complete', 'Sources linked; versions agree'], ['missing', 'A required source is missing'], ['conflict', 'Two source versions conflict']] }
    ]
  }
});

const source = (id, title, text) => ({ id, title, text, classification: 'synthetic' });
const item = (id, title, detail, refs, priority, confidence) => ({ id, title, detail, sourceRefs: refs, priority, evidenceConfidence: confidence });
function base(kind, settings, sources) {
  return {
    schemaVersion: '1.0', kind, settings, synthetic: true,
    execution: 'deterministic-fixture', liveModelCalled: false,
    humanDecision: 'not-provided', releaseStatus: 'not-authorized',
    sources, items: [], trace: [],
    limitation: 'Illustrative workflow logic only. Not an actual audit finding, regulatory requirement, authority response or validated decision-support system.'
  };
}
function audit({ evidence, focus }) {
  const sources = [
    source('PLAN-01', 'Fictional audit plan', 'Review whether corrective action on recurrent reagent transport excursions is effective. Scope: CAPA and traceable evidence.'),
    source('CAPA-01', 'Fictional CAPA record v2', 'Action: revise transport handling and train operators. Closure criterion: zero repeat excursions across three successive monitored lots. Record status: closed.')
  ];
  if (evidence === 'missing') sources.push(source('INDEX-01', 'Supplied evidence index', 'Training record and CAPA closure summary supplied. The effectiveness assessment and monitored-lot results are not in this packet.'));
  if (evidence === 'conflict') sources.push(
    source('SUMMARY-01', 'Fictional effectiveness summary v1', 'Summary states zero repeat excursions in all three monitored lots.'),
    source('LOG-01', 'Fictional monitored-lot log v2', 'L01: zero excursions. L02: one excursion. L03: zero excursions. No reconciliation to the summary is provided.')
  );
  if (evidence === 'complete') sources.push(source('EFFECT-01', 'Fictional effectiveness assessment v2', 'L01, L02 and L03 each recorded zero repeat excursions. The assessment links all three lot logs, identifies the reviewer and documents the closure rationale.'));
  const result = base('audit', { evidence, focus }, sources);
  result.title = focus === 'capa' ? 'Challenge the closure rationale.' : 'Follow the evidence chain.';
  result.contract = 'audit-challenge-hypotheses/v1';
  result.status = evidence === 'complete' ? 'Ready for human review' : 'Evidence gap to investigate';
  result.summary = 'Priority reflects the potential consequence if the concern is confirmed. Confidence refers only to what the supplied packet supports.';
  if (evidence === 'missing') {
    result.question = focus === 'capa' ? 'What evidence demonstrates that the three-lot effectiveness criterion was met before closure?' : 'Can we trace the closure decision to the versioned effectiveness assessment and its underlying lot results?';
    result.items.push(item('A-01', 'Closure cannot be corroborated from this packet', 'Ask for the effectiveness assessment and underlying lot results. Missing from the supplied packet does not mean the activity was never performed.', ['CAPA-01', 'INDEX-01'], 'High if confirmed', 'High: packet gap only'));
  } else if (evidence === 'conflict') {
    result.question = focus === 'capa' ? 'How was closure justified when the underlying log records a repeat excursion?' : 'Which version is authoritative, and how was the summary reconciled to the lot log?';
    result.items.push(item('A-02', 'Summary and lot log disagree', 'Do not average away the contradiction or select the convenient version. Resolve the source hierarchy and assess the effect on the closure decision.', ['CAPA-01', 'SUMMARY-01', 'LOG-01'], 'High if confirmed', 'High: explicit source conflict'));
  } else {
    result.question = focus === 'capa' ? 'Do these three lots adequately represent the operating conditions associated with the original failure?' : 'Can we reproduce the source-to-summary trace and confirm access, version and review controls?';
    result.items.push(item('A-03', 'The stated closure criterion is supported in the packet', 'No failure is asserted. A senior auditor can now test whether the sampling rationale addresses the original risk and whether the underlying records support the summary.', ['CAPA-01', 'EFFECT-01'], 'Risk-based follow-up', 'Bounded: supplied assessment only'));
  }
  result.machineGate = evidence === 'complete' ? 'passed-for-review' : 'review-with-unresolved-evidence';
  return result;
}
function submission({ evidence, mode }) {
  const sources = [
    source('CLAIM-01', 'Fictional assay claim', 'The proposed analytical claim covers specimen matrices A and B. No actual product, patient data or authority requirement is represented.'),
    source('STUDY-01', 'Fictional study summary', evidence === 'missing' ? 'The study packet includes analytical results for matrix A only. Matrix B evidence is not supplied.' : 'The study packet includes analytical results for matrices A and B and links both to the proposed analytical claim.'),
    source('INTENT-01', 'Fictional sponsor objective', 'Determine whether the evidence supports the proposed matrix claim and identify what should be clarified with subject-matter experts.')
  ];
  const result = base('submission', { evidence, mode }, sources);
  result.status = 'Simulation — human review required';
  result.machineGate = 'passed-for-review';
  const gap = evidence === 'missing';
  if (mode === 'presub') {
    result.title = 'Rehearse the sponsor’s question.';
    result.contract = 'presub-answer-rehearsal/v1';
    result.summary = 'A discussion aid: a proposed sponsor question, a possible response theme and the information needed to improve that discussion. It is not an FDA response.';
    result.question = gap ? 'How should we frame the planned matrix B evidence so the proposed claim and study strategy can be discussed clearly?' : 'What remaining design or representativeness concerns should we raise when discussing this two-matrix study strategy?';
    result.items.push(item('P-01', 'Possible response theme — simulated', gap ? 'A reviewer may ask how the sponsor will substantiate matrix B before retaining the full claim. Ask the SME what evidence is missing, planned or outside scope.' : 'A reviewer may ask how the tested specimens and conditions represent the proposed use. Coverage alone does not establish study adequacy.', ['CLAIM-01', 'STUDY-01', 'INTENT-01'], 'Discussion preparation', 'Not a response probability'));
  } else {
    result.title = 'Test whether the claim outruns the evidence.';
    result.contract = 'submission-challenge-review/v1';
    result.summary = 'Potential reviewer challenges, linked to the supplied evidence. No approval probability or predicted authority decision.';
    result.question = gap ? 'Where is the evidence supporting matrix B, or what is the rationale for narrowing the claim?' : 'What independent review confirms the two-matrix evidence is sufficient for the intended claim?';
    result.items.push(item('S-01', gap ? 'Potential evidence-coverage gap' : 'No matrix-coverage gap in this fixture', gap ? 'Matrix B is in the claim but absent from the supplied study packet. Confirm the complete dossier before escalating the concern.' : 'Both matrices are represented. This check does not establish statistical adequacy, overall submission completeness or regulatory acceptance.', ['CLAIM-01', 'STUDY-01'], gap ? 'High if confirmed' : 'SME verification', gap ? 'High: fixture coverage mismatch' : 'Bounded: coverage check only'));
  }
  result.evaluationPlan = { freezeInput: true, withholdActualAuthorityResponse: true, reviewBy: 'Independent SMEs', measures: ['Useful challenges', 'Unsupported claims', 'Missed material issues', 'Source traceability'], measuredModelPerformance: null };
  return result;
}
function orchestration({ packet }) {
  const sources = [source('MANIFEST-01', 'Synthetic packet manifest', packet === 'missing' ? 'Approved product context listed as required but absent.' : packet === 'conflict' ? 'Product context v1 and v2 contain different claims. The authoritative version has not been resolved.' : 'Product context v2, prior-feedback extract v1 and scope v1 are present. Versions and record links match this fixture.')];
  const result = base('orchestration', { packet }, sources);
  const clear = packet === 'complete';
  result.title = clear ? 'Machine checks pass. Human authority remains.' : 'Stop the unsupported path.';
  result.status = clear ? 'Awaiting human review' : 'Blocked at source gate';
  result.machineGate = clear ? 'passed-for-review' : 'blocked';
  result.contract = 'evidence-review-package/v1';
  result.summary = clear ? 'The simulated specialists can run and their output can enter review. Passing a deterministic check is not regulatory approval.' : 'The orchestrator does not ask specialists to fill the gap with plausible text. It returns a targeted request to the source owner.';
  result.question = clear ? 'Does the accountable reviewer accept the evidence and the proposed next actions?' : packet === 'missing' ? 'Can the source owner provide the required product context and confirm its version?' : 'Can the source owner resolve which product-context version governs this case?';
  result.trace = [
    { step: 'Intake contract', state: 'passed', detail: 'Scope, intended use and required inputs recorded.' },
    { step: 'Source gate', state: clear ? 'passed' : 'stopped', detail: clear ? 'Required sources present; fixture versions agree.' : packet === 'missing' ? 'Required product context missing. Request source; stop specialist execution.' : 'Conflicting product claims. Resolve authority; stop specialist execution.' },
    { step: 'Specialist roles', state: clear ? 'passed' : 'held', detail: clear ? 'Simulated evidence, challenge and cross-check roles produce bounded outputs.' : 'Not executed. No inference substituted for the missing decision.' },
    { step: 'Output contract', state: clear ? 'passed' : 'held', detail: clear ? 'Required fields and source references pass fixture checks.' : 'No review package eligible for release.' },
    { step: 'Human review', state: 'held', detail: clear ? 'Awaiting accountable review. No automatic approval or publication.' : 'Escalate the evidence problem to its owner.' }
  ];
  result.items.push(item('O-01', clear ? 'Package eligible for review only' : 'Resolve source condition', result.question, ['MANIFEST-01'], clear ? 'Reviewer decision' : 'Blocks this run', 'Deterministic fixture condition'));
  return result;
}
export function runScenario(kind, settings = {}) {
  if (!Object.hasOwn(modes, kind)) throw new Error('Unknown demonstration');
  const checked = {};
  for (const field of modes[kind].fields) {
    checked[field.id] = settings[field.id] ?? field.options[0][0];
    if (!field.options.some(([value]) => value === checked[field.id])) throw new Error(`Invalid ${field.id}`);
  }
  return ({ audit, submission, orchestration })[kind](checked);
}
// Protect spreadsheet users if the reusable exporter later accepts untrusted text.
function cell(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+@-]/u.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export function toCSV(result) {
  const rows = [['id', 'title', 'detail', 'priority', 'evidence_confidence', 'source_refs', 'synthetic', 'release_status']];
  for (const i of result.items) rows.push([i.id, i.title, i.detail, i.priority, i.evidenceConfidence, i.sourceRefs.join('; '), 'true', result.releaseStatus]);
  return rows.map(row => row.map(cell).join(',')).join('\r\n') + '\r\n';
}
export function toMarkdown(result) {
  return [`# ${result.title}`, '', '**Synthetic demonstration — deterministic fixture, no live AI.**', '', `Status: ${result.status}`, `Contract: ${result.contract}`, `Release: ${result.releaseStatus}`, '', result.summary, '', '## First question', '', result.question, '', ...result.items.flatMap(i => [`## ${i.id} · ${i.title}`, '', i.detail, '', `Priority: ${i.priority} | Evidence confidence: ${i.evidenceConfidence}`, `Sources: ${i.sourceRefs.join(', ')}`, '']), '## Source packet', '', ...result.sources.flatMap(s => [`### ${s.id} · ${s.title}`, '', s.text, '']), '## Boundary', '', result.limitation, ''].join('\n');
}
