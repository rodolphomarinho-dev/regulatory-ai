# Evals that lead to a review decision

I use evaluations to make agent work easier to inspect and correct. Checks during execution matter, and I review the final output. When a material discrepancy appears, I discuss the evidence with the Regulatory team before deciding what to use.

## Five layers

| Layer | What I look at | What the signal can change |
| --- | --- | --- |
| 1. Components | Source versions, individual tool results, structured fields and output contracts, including deterministic tests where appropriate | Repair a component or stop an invalid input before it reaches the next step |
| 2. Trajectory | Sequence of steps, tool use, specialist handoffs and required gates | Route the work back, pause execution or correct the handoff |
| 3. Outcome | Support, completeness, material omissions and consistency with the task | Return an evaluation signal to the main agent and flag an output for review |
| 4. System monitoring | Patterns, recurring failures and quality drift across real usage over time | Surface changes that need investigation and regression coverage |
| 5. Human regulatory review | Source evidence, applicability, materiality and the proposed disposition | Make the accountable decision about revision, non-applicability, holding the work and final use |

These layers connect technical checks with accountable regulatory judgment. Checks during the workflow inform the final human review; they do not replace it.

Deterministic tests remain useful for component behavior. Model-based grading applies human-defined criteria; its result does not establish legal authority.

## Where I use Jev

I use TypeSafe System One Models (Jev) at layers 3 and 4 for typed evaluation decisions. These checks sit alongside checks during execution and final human review. I treat a material signal as something to investigate against the evidence.

TypeSafe describes [System One](https://docs.typesafe.ai/concepts/system-one) as typed decision models, not prose explanation generators, and distinguishes calibration across groups from the correctness of an individual decision. Its [confidence documentation](https://docs.typesafe.ai/confidence) explains confidence derived from the answer distribution. A reviewer still needs the source, the evaluated claim and the surrounding context.

This repository does not integrate a Jev API, expose a model score or measure model performance. The monitoring layer is an illustrated design responsibility: the demo shows one alert that could feed a monitoring stream, not evidence of patterns or quality drift across real usage. It does not collect production telemetry.

## A synthetic discrepancy, followed through

In the illustrative source-mapping case, a Machinery Regulation row points to a Machinery Directive mapping in the fictional reference packet. This is a deliberately constructed mismatch. There is no real product, legal determination or claim about which instrument applies in practice.

1. An evaluation flags the mismatch and returns the signal to the main agent.
2. The main agent pauses the affected work and presents the draft mapping and source evidence.
3. I review that evidence with the Regulatory team and choose a disposition.
4. If the mapping is wrong, revise it and rerun. If the questioned requirement is not applicable, document the evidence and rationale, then rerun. If evidence is missing, hold the work until a source is available.
5. Review the resulting output before final use. A successful rerun is not itself regulatory approval.

The interactive decision buttons illustrate these branches. They do not authenticate a reviewer, store a real approval or establish non-applicability. The reasons shown are deterministic fixture content for inspection, not explanations produced by Jev.

## Domain references

I use domain-reference notebooks covering EU/CE IVD regulations, guidance, position papers and industry opinions; FDA medical-device cross-center guidance; a PCCP knowledge base; and China deficiency letters. They help locate relevant material and frame the review.

I check the cited originals for authority, version and applicability to the case. A notebook response is not independent validation. Regulations, official guidance, position papers and industry opinions retain their different status; a useful opinion does not become a regulatory requirement. The public example contains only these topic labels, with no internal notebook links or source content.

## Learning from the review

Once a case is adjudicated, preserve the input, source context, expected disposition and reason for the decision in a regression benchmark. Rerun it when the model, context or orchestration changes. Track both unsupported challenges and material omissions; repeatedly passing known cases does not establish generalization.

Keep the held-out evaluation set distinct from tuning and regression cases. For a model-backed pilot, agree the intended use, reviewer rubric, thresholds, denominators and release authority before interpreting results. Use independent subject-matter review where appropriate, report uncertainty and repeated-run variation, and investigate material discrepancies with the accountable team.

## What the public checks establish

The automated tests verify the deterministic demo's contracts, branches, holds, exports and human-review boundary. Passing them establishes only that the specified code and fixtures behave as expected. It does not validate an LLM, demonstrate zero errors or establish audit, clinical or regulatory effectiveness.

The public workbench is a synthetic illustration of my approach. Model-backed validation and disclosure review require their own evidence.
