---
name: how-to-help-me-review-pr
description: Prepare the user to manually review and understand a pull request efficiently.
disable-model-invocation: true
---

# Help Me Review a PR

Help a senior engineer gain the initial understanding needed for the final
human review of a merge-ready PR. Optimize for clarity and signal. Use the HTML
as a short orientation guide; use follow-up chat for depth.

## Workflow

### 1. Ask for the PR

Always ask the user for the PR URL or number.

### 2. Investigate deeply

Understand the PR before explaining it. Read the PR discussion, commits, linked
issues, diff, important surrounding code, callers, dependencies, and relevant
CI history. Use tests as evidence of behavior.

Prioritize meaningful production changes. Bring generated or mechanical
changes into the explanation when they carry unusual meaning or risk.

Reconstruct the implementation's intent, obstacles, workarounds, and tradeoffs.
Label the basis for each important claim:

- **Documented** — stated in the PR, issue, commit, or code
- **Inferred** — the most likely explanation from surrounding evidence
- **Unknown** — material context that remains unclear

### 3. Create a concise HTML guide

Create one self-contained HTML file with inline CSS and JavaScript:

`/tmp/YYYY-MM-DD-pr-review-<short-slug>.html`

Open it automatically. Aim for a five-minute read. Prefer short paragraphs,
bullets, concrete examples, and visual or interactive explanations over
detailed prose. Introduce enough system context to support the mental model,
then leave deeper details for follow-up questions.

Use these sections:

1. **At a glance**
   - Purpose and visible outcome
   - Smallest accurate mental model
   - Scope and important boundaries

2. **How it works**
   - One concept-led flow through the change
   - One concrete example
   - A targeted visual or interactive explanation when it clarifies the flow

3. **Why it took this shape**
   - The few important obstacles, workarounds, and tradeoffs
   - Clear Documented, Inferred, or Unknown labels

4. **Review route**
   - A short ordered list of the code areas worth inspecting
   - What to understand or verify at each stop
   - Direct PR file and line links

5. **Questions worth asking**
   - A small FAQ covering likely questions about surprising choices,
     boundaries, failure modes, and alternatives
   - Brief answers that invite deeper follow-up

6. **Potential concerns**
   - A compact appendix for concrete concerns found during investigation
   - Evidence, impact, and uncertainty for each concern

For large PRs, provide one concise map of the whole change and suggest focused
deep dives for complex subsystems.

## HTML quality

- Use a responsive linear page with a small table of contents.
- Write clear, direct technical prose.
- Use callouts sparingly for key decisions and assumptions.
- Include code snippets when they materially improve the mental model.
- Render code in `<pre>` elements styled with `white-space: pre` or
  `white-space: pre-wrap`.
- Prefer diagrams, before/after comparisons, progressive disclosure, or
  lightweight animation when they explain a concept faster than prose.
- Build visuals and interactions with HTML, CSS, and JavaScript. Keep them
  purposeful, intuitive, and focused on the concept.

## Follow-up questions

Expect the user to send questions in a batch after reading the guide.

- Identify the shared mental-model gap behind related questions.
- Answer related small questions together.
- Give a large question its own focused response.
- Explain relationships between questions when useful.
- Order answers for the fastest path to understanding.

Keep follow-up discussion in chat. Regenerate the HTML upon request.