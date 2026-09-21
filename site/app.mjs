import { modes, runScenario, toCSV, toMarkdown } from './demo-engine.mjs';
import { exploreReviewPath, reviewPaths } from './eval-workflow.mjs';
import { demoHash, demoFromHash } from './demo-links.mjs';
const $ = id => document.getElementById(id);
const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
let current = 'audit';
let result = null;
const tabs = [...document.querySelectorAll('[data-demo]')];
function select(kind, focus = false) {
  current = kind;
  result = null;
  for (const tab of tabs) {
    const selected = tab.dataset.demo === kind;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (focus && selected) tab.focus();
  }
  $('demo-panel').setAttribute('aria-labelledby', `tab-${kind}`);
  $('demo-title').textContent = modes[kind].title;
  $('demo-description').textContent = modes[kind].description;
  $('demo-fields').innerHTML = modes[kind].fields.map(f => `<label class="field-label" for="field-${escape(f.id)}">${escape(f.label)}</label><select id="field-${escape(f.id)}">${f.options.map(([v, label]) => `<option value="${escape(v)}">${escape(label)}</option>`).join('')}</select>`).join('');
  $('output').innerHTML = '<div class="empty-state"><span class="empty-icon" aria-hidden="true">↳</span><h3>Start with a scenario.</h3><p>You’ll see the sources, the questions and the reason for each gate.</p></div>';
  $('output-status').textContent = 'Ready to explore';
  $('output-status').className = 'output-status';
  $('download-actions').hidden = true;
}
function run() {
  const settings = Object.fromEntries(modes[current].fields.map(f => [f.id, $(`field-${f.id}`).value]));
  result = runScenario(current, settings);
  renderResult();
}
function renderResult() {
  $('output-status').textContent = result.machineGate === 'blocked' ? result.escalation ? 'EVAL GATE: PAUSED' : 'SOURCE GATE: STOP' : 'HUMAN REVIEW REQUIRED';
  $('output-status').className = `output-status ${result.machineGate === 'blocked' ? 'warn' : 'good'}`;
  const trace = result.trace.length ? `<div class="trace">${result.trace.map((t, i) => `<div class="trace-row ${escape(t.state)}"><span class="trace-index">0${i + 1}</span><strong>${escape(t.step)}<br><small>${escape(t.state.toUpperCase())}</small></strong><span class="trace-detail">${escape(t.detail)}</span></div>`).join('')}</div>` : '';
  $('output').innerHTML = `<h3 class="result-title">${escape(result.title)}</h3><p class="result-summary">${escape(result.summary)}</p>${trace}<p class="result-question">${escape(result.question)}</p><div class="findings">${result.items.map(i => `<article class="finding"><strong>${escape(i.title)}</strong><p>${escape(i.detail)}</p><small>PRIORITY: ${escape(i.priority)}<br>CONFIDENCE: ${escape(i.evidenceConfidence)}<br>SOURCES: ${escape(i.sourceRefs.join(' · '))}</small></article>`).join('')}</div><details class="source-details"><summary>Inspect the synthetic evidence (${result.sources.length} sources) <span aria-hidden="true">+</span></summary>${result.sources.map(s => `<div class="source-item"><code>${escape(s.id)} / ${escape(s.title)}</code><p>${escape(s.text)}</p></div>`).join('')}</details><pre class="contract">contract: ${escape(result.contract)}\nexecution: deterministic-fixture\nlive_model_called: false\nhuman_decision: not-provided\nrelease_status: not-authorized</pre><p class="result-note">${escape(result.limitation)}</p>`;
  const graph = document.createElement('div');
  graph.className = `evidence-graph ${result.machineGate === 'blocked' ? 'stopped' : ''}`;
  graph.setAttribute('role', 'img');
  graph.setAttribute('aria-label', `Synthetic source dependencies: ${result.sources.map(s => s.id).join(', ')} feed the ${current} harness. ${result.status}.`);
  graph.innerHTML = `<div class="graph-sources">${result.sources.map(s => `<div class="graph-source">${escape(s.id)}</div>`).join('')}</div><div class="graph-arrow" aria-hidden="true">→</div><div class="graph-decision"><strong>${current === 'submission' ? 'Simulation' : current === 'audit' ? 'Audit' : 'Regulatory'} harness</strong><small>${escape(result.status)}</small></div>`;
  $('output').insertBefore(graph, $('output').querySelector('.result-question'));
  if (result.evaluations) {
    const checks = document.createElement('section');
    checks.className = 'eval-checkpoints';
    checks.setAttribute('aria-label', 'Five evaluation checkpoints');
    checks.innerHTML = `<h4>Five checkpoints in this run</h4><ol class="eval-layers-status">${result.evaluations.map(e => `<li class="eval-check ${escape(e.state)}"><span class="eval-layer">L${e.layer}</span><div><strong>${escape(e.name)}</strong><small>${escape(e.state.toUpperCase())}</small><p>${escape(e.detail)}</p></div></li>`).join('')}</ol>`;
    $('output').insertBefore(checks, $('output').querySelector('.trace'));
    const fullTrace = $('output').querySelector('.trace');
    const traceDetails = document.createElement('details');
    traceDetails.className = 'trace-details';
    traceDetails.innerHTML = '<summary>Inspect the full orchestration trace <span aria-hidden="true">+</span></summary>';
    fullTrace.replaceWith(traceDetails);
    traceDetails.append(fullTrace);
  }
  if (result.escalation) {
    const alert = document.createElement('section');
    alert.className = 'eval-alert';
    alert.setAttribute('aria-label', 'Main agent discrepancy update');
    alert.innerHTML = `<span class="mono">LOCAL SIMULATION · ${escape(result.escalation.id)}</span><h4>Main agent update</h4><p><strong>${escape(result.escalation.outcomeSignal)}</strong> → ${escape(result.escalation.action)}</p><dl class="eval-meta"><dt>Checkpoint</dt><dd>${escape(result.escalation.checkpoint)}</dd><dt>Affected draft</dt><dd>${escape(result.escalation.affectedArtifact)}</dd><dt>Review owner</dt><dd>${escape(result.escalation.owner)}</dd></dl><p>${escape(result.escalation.reason)}</p>`;
    $('output').insertBefore(alert, $('output').querySelector('.eval-checkpoints'));
    const decision = document.createElement('section');
    decision.className = 'decision-paths';
    decision.setAttribute('aria-label', 'Explore a hypothetical regulatory team decision');
    if (!result.reviewSimulation) {
      decision.innerHTML = `<h4>Discuss the evidence. Choose the next path.</h4><p>Imagine I’ve reviewed the source comparison with the Regulatory team. Explore what the harness does after each possible disposition.</p><div class="decision-buttons">${result.reviewOptions.map(key => `<button class="small-button" data-review-path="${key}">${escape(reviewPaths[key].title)}</button>`).join('')}</div><small>Hypothetical branches only. No real regulatory decision, approval or message is recorded.</small>`;
      decision.querySelectorAll('[data-review-path]').forEach(button => button.addEventListener('click', () => {
        result = exploreReviewPath(result, button.dataset.reviewPath);
        renderResult();
        $('output').querySelector('.decision-result').focus();
      }));
    } else {
      decision.innerHTML = `<div class="decision-result" tabindex="-1"><span class="mono">HYPOTHETICAL TEAM DISPOSITION</span><h4>${escape(result.reviewSimulation.title)}</h4><p>${escape(result.reviewSimulation.next)}</p><p>The original alert stays in the trace. Final human review and release remain outside this demo.</p><button class="small-button" id="reset-eval">Try another decision path</button></div>`;
      decision.querySelector('button').addEventListener('click', () => { run(); $('output').querySelector('[data-review-path]').focus(); });
    }
    $('output').insertBefore(decision, $('output').querySelector('.source-details'));
  }
  $('download-actions').hidden = false;
}
function download(extension, mime, content) {
  if (!result) return;
  const link = document.createElement('a');
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  link.href = url;
  link.download = `synthetic-${current}-review.${extension}`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function switchTab(kind, focus = false) {
  select(kind, focus);
  history.replaceState(null, '', demoHash(kind));
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => switchTab(tab.dataset.demo));
  tab.addEventListener('keydown', event => {
    const positions = { ArrowRight: (i + 1) % tabs.length, ArrowLeft: (i + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 };
    if (Object.hasOwn(positions, event.key)) { event.preventDefault(); switchTab(tabs[positions[event.key]].dataset.demo, true); }
  });
});
document.querySelectorAll('[data-open-demo]').forEach(link => link.addEventListener('click', () => {
  select(link.dataset.openDemo);
  if (current === 'orchestration' && link.dataset.evalCase === 'machinery') {
    $('field-evalCase').value = 'machinery';
    run();
  }
}));
$('run-demo').addEventListener('click', run);
$('demo-fields').addEventListener('change', () => {
  result = null;
  $('download-actions').hidden = true;
  $('output-status').textContent = 'CONFIGURATION CHANGED';
  $('output-status').className = 'output-status';
  $('output').innerHTML = '<div class="empty-state"><span class="empty-icon" aria-hidden="true">↳</span><h3>New evidence. New run.</h3><p>Run this scenario to refresh the trace and review package.</p></div>';
});
$('download-json').addEventListener('click', () => download('json', 'application/json', JSON.stringify(result, null, 2)));
$('download-csv').addEventListener('click', () => download('csv', 'text/csv;charset=utf-8', '\ufeff' + toCSV(result)));
$('download-brief').addEventListener('click', () => download('md', 'text/markdown;charset=utf-8', toMarkdown(result)));
window.addEventListener('hashchange', () => {
  const target = demoFromHash(location.hash);
  if (target && target !== current) select(target);
});
select(demoFromHash(location.hash) ?? 'audit');
