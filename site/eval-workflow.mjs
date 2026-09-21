// Synthetic checkpoint and reviewer branches. No model, legal decision or live alert.
const source = (id, title, text) => ({ id, title, text, classification: 'synthetic' });
const check = (layer, name, state, detail) => ({ layer, name, state, detail });

export function addEvaluationCheckpoints(result, evalCase) {
  const sourceBlocked = result.machineGate === 'blocked';
  const issue = evalCase !== 'clear';
  result.evalCase = evalCase;
  result.evaluator = {
    design: 'TypeSafe AI System One Models (Jev) at layers 3 and 4',
    execution: 'scripted demonstration, not a Jev response',
    liveCall: false, measuredPerformance: null,
    boundary: 'Typed signals inform routing. Confidence is not proof of correctness or regulatory authority.'
  };
  if (issue) result.sources.push(
    source('MAP-01', 'Fictional gap-analysis row v1', 'A row labelled Machinery Regulation is marked covered, but its evidence link points to a Machinery Directive mapping. No applicability rationale is attached.'),
    source('SCOPE-01', 'Fictional applicability packet', evalCase === 'uncertain'
      ? 'The product scope and relevant date are ambiguous. The reviewer cannot resolve applicability from this packet.'
      : 'The source references and row labels disagree. The team must establish the applicable framework using the authoritative sources, product scope and relevant date. This fixture makes no legal applicability determination.')
  );
  const outcome = sourceBlocked ? 'held' : !issue ? 'passed' : evalCase === 'uncertain' ? 'uncertain' : 'flagged';
  result.evaluations = [
    check(1, 'Components', sourceBlocked ? 'stopped' : 'passed', sourceBlocked ? 'Required source missing or conflicting; downstream assessment cannot proceed.' : 'Required inputs, fixture references and output fields are present. Presence alone does not establish that a claim is supported.'),
    check(2, 'Trajectory', sourceBlocked ? 'held' : 'passed', sourceBlocked ? 'Specialist work is held at the source gate.' : 'The simulated specialist used the permitted sources and handed over the gap-analysis draft. Check the route, not only the final prose.'),
    check(3, 'Outcome', outcome, sourceBlocked ? 'Not assessed: source gate blocked.' : !issue ? 'No mismatch in this fixture. Not an overall quality or regulatory-completeness score.' : evalCase === 'uncertain' ? 'Scripted Jev-style result: insufficient_context. Do not turn ambiguity into a pass.' : 'Scripted Jev-style result: evidence_mismatch. The row label and linked framework do not support a clean coverage claim.'),
    check(4, 'System monitoring', sourceBlocked ? 'held' : issue ? 'alerted' : 'passed', sourceBlocked ? 'Source blocker recorded; no outcome signal fabricated.' : issue ? 'The harness records EVAL-01 and routes it to the main agent. A material mismatch or insufficient context pauses this deliverable; no numeric threshold is invented.' : 'This run is recorded as clear-for-review. A single fixture is not a live monitoring history.'),
    check(5, 'Human regulatory review', 'held', 'Rodolpho and the Regulatory team review material discrepancies. The accountable reviewer checks the final output; no real decision or release occurs here.')
  ];
  if (!sourceBlocked && issue) {
    result.machineGate = 'blocked';
    result.title = 'The eval caught it before handoff.';
    result.status = 'Paused at an in-process eval';
    result.summary = 'The main agent receives a source-linked discrepancy and holds the affected draft. I review it with the Regulatory team before we choose how to continue.';
    result.question = 'Is the mapping wrong, is this requirement outside the agreed scope, or do we need more evidence?';
    result.items[0] = {
      id: 'O-01', title: 'Coverage claim needs regulatory review',
      detail: 'A Machinery Regulation row points to a Machinery Directive mapping. That is a reason to investigate, not a finding that one framework legally applies. The comparison text is assembled by the harness; it is not a Jev-generated explanation.',
      sourceRefs: ['MAP-01', 'SCOPE-01'], priority: 'Blocks the affected draft', evidenceConfidence: 'Synthetic mismatch or uncertainty signal; not measured model confidence'
    };
    result.escalation = {
      id: 'EVAL-01', checkpoint: 'After specialist draft; before document assembly',
      recipient: 'Main agent', owner: 'Rodolpho + Regulatory team',
      outcomeSignal: evalCase === 'uncertain' ? 'insufficient_context' : 'evidence_mismatch',
      monitoringSignal: 'review_required', affectedArtifact: 'Gap analysis / row MAP-01',
      sourceRefs: ['MAP-01', 'SCOPE-01'], action: 'pause_affected_deliverable',
      reason: 'Do not silently select a framework or mark a disputed row as covered.',
      delivery: 'simulated-local-event-only'
    };
    result.events = [{ id: 'EVT-01', kind: 'eval.alert', to: 'main-agent', issue: 'EVAL-01', disposition: 'paused' }];
    result.reviewOptions = ['revise', 'exclude', 'request'];
  }
  result.trace = [
    ...result.trace.slice(0, 3),
    { step: 'Outcome eval · L3', state: issue && !sourceBlocked ? 'stopped' : sourceBlocked ? 'held' : 'passed', detail: result.evaluations[2].detail },
    { step: 'Monitoring · L4', state: issue && !sourceBlocked ? 'stopped' : sourceBlocked ? 'held' : 'passed', detail: result.evaluations[3].detail },
    ...(result.escalation ? [{ step: 'Main agent updated', state: 'stopped', detail: 'EVAL-01 received. Affected output paused; evidence references and the unresolved decision are kept together.' }] : []),
    { step: 'Output contract', state: result.machineGate === 'blocked' ? 'held' : 'passed', detail: result.machineGate === 'blocked' ? 'No final package can proceed while this blocker is unresolved.' : 'Fixture output fields and source references are ready for review only.' },
    { step: 'Human review · L5', state: 'held', detail: result.evaluations[4].detail }
  ];
  return result;
}

export const reviewPaths = Object.freeze({
  revise: {
    title: 'Revise the mapping',
    rationale: 'In this hypothetical review, the team confirms a mapping error. The source owner supplies a corrected, versioned evidence link; the specialist revises the affected row.',
    change: 'Corrected mapping and supporting reference agree in fixture v2.',
    next: 'Rerun component, trajectory and outcome checks on the revised row. Return the updated package for final human review.'
  },
  exclude: {
    title: 'Document non-applicability',
    rationale: 'In this hypothetical review, the team establishes that the requirement is outside the agreed scope. The decision needs an authoritative reference and a recorded rationale; it is not a machine exemption.',
    change: 'Row retained as not applicable in fixture v2, with scope, source reference and reviewer rationale. It is not deleted or labelled covered.',
    next: 'Rerun scope and coverage checks using the documented disposition. Return the package for final human review.'
  },
  request: {
    title: 'Hold for more evidence',
    rationale: 'The team cannot resolve the discrepancy from the available sources. The main agent sends the issue back to the source owner in this simulation.',
    change: 'No source or finding is rewritten. EVAL-01 remains open.',
    next: 'Keep the affected deliverable blocked until the requested scope, date and authoritative evidence arrive.'
  }
});

export function exploreReviewPath(previous, path) {
  if (previous.kind !== 'orchestration' || !previous.escalation || !previous.reviewOptions?.includes(path) || !Object.hasOwn(reviewPaths, path)) throw new Error('No eligible review path');
  if (previous.reviewSimulation) throw new Error('Rerun the original scenario before exploring another decision');
  const result = structuredClone(previous);
  const choice = reviewPaths[path];
  const rerun = path !== 'request';
  result.reviewSimulation = { path, title: choice.title, rationale: choice.rationale, next: choice.next, actualHumanApproval: false };
  result.originalIssue = structuredClone(previous.escalation);
  result.events.push({ id: 'EVT-02', kind: 'review.path.simulated', to: 'main-agent', issue: 'EVAL-01', disposition: path });
  result.machineGate = rerun ? 'passed-for-review' : 'blocked';
  result.status = rerun ? 'Rechecked fixture — final human review still required' : 'Still blocked — waiting for evidence';
  result.title = rerun ? 'A chosen path. A fresh check.' : 'Keep the unresolved question open.';
  result.summary = choice.rationale;
  result.question = choice.next;
  result.escalation.action = rerun ? 'return_to_final_human_review' : 'wait_for_source_owner';
  result.escalation.resolution = rerun ? 'resolved-in-hypothetical-fixture-only' : 'unresolved';
  result.sources.push(source('REVIEW-01', 'Hypothetical team disposition', choice.rationale));
  if (rerun) result.sources.push(source('MAP-02', 'Fictional gap-analysis row v2', choice.change));
  result.items[0].title = rerun ? 'Original issue retained; hypothetical revision rechecked' : 'EVAL-01 remains open';
  result.items[0].priority = rerun ? 'Final human review required' : 'Blocks the affected draft';
  result.items[0].detail = choice.change;
  result.items[0].sourceRefs.push('REVIEW-01', ...(rerun ? ['MAP-02'] : []));
  result.evaluations[2] = check(3, 'Outcome', rerun ? 'passed' : 'held', rerun ? 'Recheck of revised fixture v2 passes its stated condition. This does not validate legal applicability or model performance.' : 'Cannot recheck without the missing evidence.');
  result.evaluations[3] = check(4, 'System monitoring', rerun ? 'recorded' : 'alerted', rerun ? 'Original alert, hypothetical disposition and recheck remain in the local trace. Candidate regression case; no production history implied.' : 'Open alert retained. No silent pass or forced completion.');
  result.evaluations[4] = check(5, 'Human regulatory review', 'held', 'A hypothetical branch has been explored, not approved. A real final review and release authorization are still outside this demo.');
  result.trace.push(
    { step: 'Team discussion · simulated', state: 'passed', detail: choice.rationale },
    { step: 'Revision + recheck', state: rerun ? 'passed' : 'held', detail: choice.change },
    { step: 'Output contract · recheck', state: rerun ? 'passed' : 'held', detail: rerun ? 'Revised fixture includes the disposition, retained original sources and updated row references. Eligible for final review only.' : 'No revised review package can pass without the missing evidence.' },
    { step: 'Final human review', state: 'held', detail: result.evaluations[4].detail }
  );
  result.regressionCandidate = rerun ? { issue: 'EVAL-01', status: 'illustrative-candidate', next: 'Adjudicate the real case before adding it to regression tests. Keep the held-out evaluation set separate.' } : null;
  result.events.push({ id: 'EVT-03', kind: rerun ? 'fixture.rechecked' : 'source.request.pending', to: 'main-agent', issue: 'EVAL-01', disposition: rerun ? 'review-only' : 'blocked' });
  return result;
}
