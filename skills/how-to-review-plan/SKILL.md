---
name: how-to-review-plan
description: Use when reviewing an implementation plan
user-invocable: true
---

# How to Review a Plan

Input: `plan.md`, with `spec.md` and `context/` when they exist. Output: a list of findings for the planner.

Your goal is to find what the planner got wrong or missed. You report; the planner decides and changes the plan.

## Check

- **Assumptions.** Check each claim about the code (what exists, what calls what, what a field holds) in the code itself.
- **The approach.** Is this the right problem, solved fully and no more? When a different approach is clearly simpler, safer, or a better fit, say so.
- **Decisions.** For each important decision, check that the reason holds and what the alternative would cost.
- **Missed cases.** Find the flows, states, and inputs the plan does not cover: errors, empty and loading states, permissions, both sides of a feature flag, existing data, concurrency, and nearby flows the change can break.
- **Fit.** Existing code to reuse, and patterns the codebase already follows.
- **Order.** Each ticket can ship safely by itself, in the planned order.
- **Verification.** Each part has a real way to prove it works.
- **Rollout.** Flags, migrations, backward compatibility, and blast radius.

## Report

One finding per issue, most severe first:

```
[blocker | should change | nit] <title>
<what is wrong or missing, and why it matters>
Suggested change: <what you think the plan should change>
```

Keep nits short. If you find nothing important, say so.
