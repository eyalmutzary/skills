---
name: how-to-QA
description: Use when validating that a PR really does what it is expected to do, through real behavior, before it merges.
user-invocable: true
---

# How to QA a PR

Input: a PR, and a mode: `present` (the user is here) or `afk` (the user is away). Default to `present`.
Output: a QA report that proves, as far as possible, that the PR does what it should.

Your job is to observe behavior and report it. Code changes, fixes, unit tests, and lint belong to other skills.

## 1. Understand the intent

Read the PR description, linked tickets, spec, plan, commits, and the diff. Find missing context yourself: the `docs/<slug>/` folder, surrounding code, the Figma link.

Write down:

- **Type**: feature, bug fix, behavior change, or refactor.
- **Intent**: what the developer wanted, in a few sentences.
- **Expected behaviors**: each observable result the PR should produce.

Done when every expected behavior traces back to the spec, the plan, or the PR itself.

## 2. Choose the tactic

Pick the tools the PR needs, and give one line of reason for each:

- **Browser**: UI changes and client behavior. Take screenshots as evidence.
- **Server**: endpoints, jobs, data. Call the real code path and read the logs.
- **End to end**: behavior that crosses client and server.
- **Design**: compare UI screenshots to the Figma design with the available Figma tools. Check layout, spacing, colors, text, states, and the overall UX.
- **No QA**: when nothing observable changed. Write the reason.

For local runs, follow `/how-to-debug-e2e`. For a clean base checkout, reuse `<repo-root>/.claude/worktrees/qa-base`.
If you have a worker id, add it to every `/tmp` file name and to the `qa-base` worktree name.

## 3. Make a test plan

For a complex PR, new behavior, or a real behavior change, list the use cases and edge cases first: the main flows, error states, empty states, permissions, both sides of a feature flag, and nearby flows the change could break. Mark the ones worth testing by hand.

For a bug fix, reproduce the bug on the base branch first when it is cheap. Then a pass on the PR branch proves the fix.

Done when every expected behavior from step 1 has a planned check, or a reason to skip it.

## 4. Test

Run the plan. Record each check as you go: what you did, what you saw, and evidence where it helps (screenshots, commands, log lines).

When you are blocked (a tool fails, or you need access, a test account, or a design):

- `present`: ask the user with `AskUserQuestion`, then continue.
- `afk`: record a **gap** and continue with the next check.

Before you report a defect, run the same step on a clean base checkout and put the result in the finding. A defect that is also on the base is not caused by the PR.

A failed check is a finding. Record it with the steps to reproduce it, and continue.

Allowed temporary changes, to make testing easier:

- You may add temporary logs for easier debugging.
- When a feature is behind a feature flag, you may hard-code the flag to `true`.

Remove all of them when you finish. The working tree must have no QA leftovers.

## 5. Report

Write `/tmp/qa-<pr>-<date>.md` and keep screenshots in `/tmp/qa-<pr>-<date>/`:

```
Verdict: PASS | PASS WITH GAPS | FAIL
PR:      <link>
Intent:  <one or two sentences>
Tactic:  <tools used, and why>

## Checks
✅ <behavior> — <how checked> [evidence]
❌ <behavior> — <what happened vs. expected>; repro: <steps> [evidence]
⚠️ <behavior> — gap: <what blocked it>; matters because <why>
➖ <behavior> — skipped: <reason>

## UI gotchas

- Figma check: use `/how-to-match-figma`. What Figma does not show is a gap, not a pass.
- Search or typeahead input: type at human speed, one letter at a time. Count the requests sent. One request per letter is a defect.

## Broken tools
- <tool>: <error>
```

`PASS WITH GAPS` means nothing failed, but something important stayed unchecked.

Finish with a short summary in chat: the verdict, the findings, the gaps, and the report path.
