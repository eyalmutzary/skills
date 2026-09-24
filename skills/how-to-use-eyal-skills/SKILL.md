---
name: how-to-use-eyal-skills
description: Recommend the next development step in Eyal's Claude Code workflow, based on where the user is.
disable-model-invocation: true
---

# Use Eyal's skills

The user is unsure what to do next. Locate them on the workflow map, then recommend the next step.

## Respond

1. If the user's position is unclear, ask one question: what exists so far (context files, design, spec, tickets, work breakdown, open PRs)? Look for those files in the working folder before asking.
2. Name the phase and step they are in.
3. Give **one** recommended next step with the exact skill or prompt to run, and why it matters now.
4. List the optional steps that fit, each with one line on when it pays off. Skip the rest.

## The workflow

Three phases in a loop. Attention goes to the two ends; the middle runs unattended.

**Plan** (full attention) → **Implement** (AFK) → **Review + merge** (half attention) → plan the next batch.

### Phase 1 — Plan

Planning is a dial. Turn it up for a large feature, complex logic, many repos, or a legacy area. The more hours will run unattended, the more the plan must carry. Almost never run every step.

**Step 1 — Gather context.** All output goes to **one folder** as markdown files. Each technique is optional:

- `/grill-with-docs` — the user writes all they know, then gets grilled. Big feature: separate product and technical grillings.
- Explorer sub-agents (prompt) — one per microfrontend/microservice; each writes a summary file of what matters for this feature.
- Open-source scan (prompt) — search the web for GitHub projects that already solved this.
- `/wayfinder` — when the path itself is still foggy.

**Step 2 — Grow the design in stages.** Each stage is its own markdown file, reviewed before the next:

1. High-level design (prompt).
2. Full design (prompt).
3. `/to-spec` — detailed implementation spec. Implementation follows this.
4. `/how-to-explain-plan` — **never skip.** The user learns the plan step by step, asks questions, raises concerns, until they genuinely understand it. The longest step, and the last cheap moment to catch a misunderstanding.

**Step 3 — Break into tasks.**

- `/to-tickets` — split the spec into small tickets with explicit dependencies.
- Work breakdown (prompt) — order the tickets and group them into a stack of PRs. `/how-to-implement-tasks` requires tasks, dependencies, sizes, and order.
- Optional: mirror the tickets as monday items.

### Phase 2 — Implement

`/how-to-implement-tasks` with the work breakdown.

- First it aligns: which PRs are in this batch, and how each one is tested. Nothing starts until the user approves.
- Then it runs for hours in the background. Per task: a Sonnet sub-agent implements, an Opus sub-agent reviews, up to 3 rounds, following `/how-to-write-code`. Then `/how-to-debug-e2e` proves it works for real (monday-mirror for server, Playwright for client, both for a full feature), fixing what fails. Then it opens the PR.
- Result: a gh stack of small PRs, each reviewed and verified.

Compact right before leaving the desk; the prompt cache lives 5 minutes.

### Phase 3 — Review and merge

1. Review the stack. Approve or comment. `/how-to-help-me-review-pr` or `/explain-diff-html` help understand a PR before judging it.
2. `/how-to-babysit-pr` — drives the PRs to merged, in the agreed order. It uses `/how-to-fix-pr-comments`, which treats each comment as a claim to verify, not an order.
3. Back to Phase 1 for the remaining tickets, so the next batch can run.

## Anytime

- Hard to follow an explanation → `/how-to-explain`.
- Writing code by hand → `/how-to-write-code`.
- Verifying a change or chasing a bug → `/how-to-debug-e2e`.
- Context growing large → compact; a big window is the dumb zone, slower answers and a bigger bill.
