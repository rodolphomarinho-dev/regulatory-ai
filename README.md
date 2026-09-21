# Regulatory AI — Rodolpho Marinho

**Data science, with a regulatory backbone. Model-agnostic. Harness-first.**

[Open the live workbench ↗](https://rodolphomarinho-dev.github.io/regulatory-ai/) · [GitHub profile](https://github.com/rodolphomarinho-dev)

Across my workflow: Astra, Ona, Perplexity, Antigravity, Gemini, ChatGPT and Codex. Models, platforms and tools — not a claim that they are interchangeable products. The task and the evals guide the choice.

A personal portfolio and small, runnable examples of the work I build: audit preparation, submission rehearsal and evidence-led orchestration.

The public demonstrations use **synthetic data and deterministic rules**. They make the workflow inspectable without publishing company material or pretending to run a live model. They are not clinical tools, regulatory advice or validated decision-support systems.

## Try it locally

Node.js 20 or later. No package installation, API key or account is needed.

```sh
npm test
npm run check
npm start
```

Open `http://127.0.0.1:4173`. Keep the terminal running. The portfolio requires an HTTP server because its JavaScript uses modules; double-clicking `index.html` is not the supported preview path.

## Explore three workflows

| Demonstration | Change this | Inspect this |
| --- | --- | --- |
| Audit simulation | Missing, conflicting or traceable effectiveness evidence | Evidence-linked hypotheses, auditor questions, separate priority and confidence |
| Submission rehearsal | Pre-Submission versus submission; incomplete versus matching coverage | Different output contracts and bounded challenges |
| Orchestration layers | Source readiness, then a synthetic evaluation case and review decision | Five evaluation layers, feedback to the main agent, a pause for review and the next action |

Each result exports as JSON, CSV or a Markdown brief. No data is uploaded. Nothing is approved or submitted. Exports remain explicitly synthetic.

Each demonstration has a shareable URL fragment: `#demo-audit`, `#demo-submission` and `#demo-orchestration`. Open one directly or switch tabs and copy the address. Reloading preserves the selected demonstration, not the evidence settings or an unreviewed result.

## The structure

```text
Scope + source packet
        ↓
Harness: context, tools, permissions, state
        ↓
Source gate ── missing/conflicting → source owner
        ↓
Evidence role → challenge role → cross-check role
        ↓
Output contract + provenance checks
        ↓
Human review → decision outside this demo
```

The diagram represents a production design pattern. This repository implements a deterministic simulator of selected branches, not a live multi-agent runtime. A model-backed service would require authenticated server-side execution, scoped tools, approved data handling, evaluation and accountable release controls. API keys must never be added to this static site.

- [Demo engine](site/demo-engine.mjs): scenario logic and portable exporters.
- [UI](site/app.mjs): accessible tabs, controls and trace display.
- [Fixture cases](site/examples/eval-cases.json): explicit expected outcomes.
- [Automated tests](tests/workflows.test.mjs): contracts, branching, provenance, release boundaries and export handling.
- [Case studies](docs/case-studies.md): contributions, current stage and evaluation plans.
- [Evaluation design](docs/evaluation-design.md): five layers, discrepancy handling and the limits of the public demo.
- [Sample brief](site/examples/sample-audit-brief.md): readable without JavaScript.

## Evaluation boundaries

The tests check **this code and these fixtures**. They do not measure an LLM, the effectiveness of an audit or the likelihood of an authority decision.

I organize my evaluation work across five layers: **components, trajectory, outcome, system monitoring and human regulatory review**. Deterministic tests remain useful at the component layer; model-based grading applies human-defined criteria and does not establish legal authority. Final judgment stays with the accountable reviewer.

I use [TypeSafe System One Models (Jev)](https://docs.typesafe.ai/concepts/system-one) at layers 3 and 4 for typed evaluation decisions, alongside checks during execution and my review of the final output. A material discrepancy returns to the main agent and pauses the workflow. I review the evidence with the Regulatory team, then choose to revise the mapping and rerun, document justified non-applicability and rerun, or hold for a missing source. The resulting output still needs final human review.

The expanded orchestration demo makes that decision loop inspectable with fixed, synthetic cases. A Machinery Regulation row points to a Machinery Directive mapping in a fictional reference packet. This illustrates a source-mapping discrepancy and makes no legal applicability determination. Its buttons simulate review choices; they do not record a real regulatory approval or call Jev. Layer 4 concerns patterns and quality drift across real usage over time; this demo illustrates only one alert feeding that review process. There are no model-performance measurements or live monitoring results in this repository.

TypeSafe's [confidence documentation](https://docs.typesafe.ai/confidence) explains confidence derived from the answer distribution; its [System One documentation](https://docs.typesafe.ai/concepts/system-one) distinguishes calibration across groups from the correctness of an individual decision. System One provides typed decisions, not prose explanations. Any displayed rationale in this demo is fixture text for human inspection, not an explanation generated by Jev.

My domain-reference notebooks cover EU/CE IVD regulations, guidance, position papers and industry opinions; FDA medical-device cross-center guidance; a PCCP knowledge base; and China deficiency letters. I check cited originals for authority, version and applicability. Notebook responses do not independently validate an output, and industry opinions remain distinct from regulations.

After adjudication, useful cases become regression checks. I keep a held-out evaluation set separate from tuning cases; adding a known case to regression does not make it fresh evidence of generalization.

For a model-backed pilot, I would freeze a representative input set, hold back the actual outcome, and ask independent subject-matter experts to adjudicate supported challenges and material omissions. Useful measures include precision of supported challenges, recall of adjudicated material issues, severity-weighted misses, source traceability and repeated-run variance. Report denominators and uncertainty; do not turn a small retrospective set into an approval probability.

Thresholds, intended use, data ownership and release authority must be agreed before a pilot is called successful. They are not established by this repository.

## Publish

The included Actions workflow checks the files and tests, then publishes only `site/`. In the repository's **Settings → Pages**, choose **GitHub Actions** as the publishing source. A push to `main`, or a manual workflow run, can then publish the site. See [GitHub's publishing-source documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

Public hosting makes the site public. Review employer references, project descriptions, ownership and disclosure permissions before deployment. A private repository does not by itself guarantee a private Pages site.

## Engineering influences

Harness-first, with specialist roles, inspectable handoffs and eval-driven iteration. Matt Pocock's [AI engineering terminology](https://www.aihero.dev/ai-coding-dictionary/harness) and TypeSafe's [System One documentation](https://docs.typesafe.ai/concepts/system-one) are useful references. My regulatory review layer and the synthetic workflow example are my interpretation. No affiliation or endorsement is implied.

[Connect on LinkedIn](https://www.linkedin.com/in/rodolpho-marinho-311777437/).
