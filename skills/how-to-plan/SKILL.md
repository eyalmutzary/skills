---
name: how-to-plan
description: Use when asked to plan a feature, bug fix, or any coding task, from raw request to an approved plan, tickets, and a docs PR.
user-invocable: true
---

# How to Plan

Input: a request whose result is code. Output: a PR with the context, spec, plan, and tickets, so another agent can implement it without asking anything.

Finish when the PR is open.

## 1. Estimate the effort

Rate the request on three axes, low / medium / high:

- **Vagueness** — is it explicit, or does it need research or validation first?
- **Detail** — do we know the end goal, the behavior, and the important trade-offs?
- **Blast radius** — estimate local change or cross-repo? Small or large?

Tell the user the ratings in three lines. The ratings decide how much of step 3 to run: all low means a short context pass; any high means more techniques and more depth.

## 2. Create the worktree

Choose the home folder: the `docs/` folder of the most related microservice or micro-frontend. Create `docs/<slug>/` there. Every file below goes in that folder:

```
docs/<slug>/
  context/      one md file per source of context
  spec.md
  plan.md
  tickets/
```

## 3. Gather context

Pick the techniques the case needs. Each one writes its findings into `context/`:

- **`/grill-with-docs`** — when the request can be read in many ways, or is not well defined. Run it before the other techniques, so they research the right thing.
- **Explorer sub-agents** — when the flow crosses repos or large services. Spawn a few Sonnet sub-agents in parallel, one per area. Each writes `context/<area>.md` with the files, flows, and constraints that matter for this task.
- **Figma** — when the task has UI. Read the design, write `context/design.md` with notes and the Figma link. If a design should exist and you have no link, ask the user.
- **Observability** — when production behavior must be verified (a bug, a load question, a data shape). Query logs, traces, or metrics. Write `context/observability.md` with the queries and what they showed.

Done when you can answer, with high confidence: what changes, where, why, which constraints apply, and what could break. If one of these is still a guess, gather more.

## 4. Write the spec and the plan

1. Run `/to-spec`. Write the result to `spec.md` instead of the issue tracker.
2. Write `plan.md`: the implementation plan for an agent with no context but this folder. Include:
   - The files, modules, and interfaces to change, and how.
   - The order of the work, and why.
   - Constraints and gotchas from `context/`.
   - How to verify each part: tests and manual validation.
   - Open risks.

## 5. Review the plan

Review when the plan is long, complex or any step 1 rating is high. Otherwise, skip to step 6.

Spawn one Opus sub-agent. Tell it to use `/how-to-review-plan` on `docs/<slug>/`.

Treat each finding as a claim. Check it against the code and `context/`. Fix `spec.md` and `plan.md` for the valid ones. Note the rejected ones with a one-line reason, to share in step 6.

Run the review once.

## 6. Get approval

Explain the plan to the user shortly: the goal, the main steps, the important decisions and trade-offs, the risks, and what the review changed, if it ran. Keep it high level.

If the user asks for more detail, use `/how-to-explain-plan`. Update `spec.md` and `plan.md` for every change the user requests.

Wait for explicit approval before the next step.

## 7. Split into tickets

Run `/to-tickets` on `plan.md`. Skip its quiz step: split the tickets yourself, no approval needed. Write the tickets to `tickets/`, one file per ticket, numbered in dependency order. Give each ticket a size (S / M / L), so `/how-to-implement-stack` can use them directly.

## 8. Open the PR

Commit the `docs/<slug>/` folder and open a PR from the worktree branch. The PR description holds the goal, a link to `plan.md`, and the ticket list.

If the order also asks you to build it, run `/how-to-implement-stack` on `tickets/`.
