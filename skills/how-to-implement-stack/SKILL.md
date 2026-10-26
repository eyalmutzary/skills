---
name: how-to-implement-stack
description: Use when autonomously implementing an ordered task breakdown as a stack of reviewed and verified pull requests.
user-invocable: true
---

# How to implement a stack

Input: an unambiguous work breakdown with tasks, dependencies, sizes, and order. If any
of these is missing, stop and report what is missing.

Each PR is built with `/how-to-implement`. This skill adds the batch: which PRs, in what
order, approved once, run unattended.

## Contract

Re-read this section and the run file after every compaction and before every PR.

1. **One approval covers the whole batch.** After sign-off, the turn ends when every
   approved PR is submitted or recorded as blocked. Ask the developer only for a hard
   blocker, and only in `present` mode.
2. **In `afk` mode, decide, record, continue.** Every decision and skip goes in the run file
   and the final report.

## Run file

If you have a worker id, add it to every `/tmp` file name and to the `qa-base` worktree name.

Before PR 1, write `/tmp/<project>-run.md` and keep it current at every gate transition:

```
mode:         afk | present
approved:     PR 1 (A1-A3), PR 2 (B1-B2), ...
current:      PR 1 / task A2 / gate 3 review
agents:       implementer=<name>  reviewer=<name>  qa=<name>
validation:   PR 1: unit tests | Playwright | mirrored backend | full e2e
e2e inputs:   test account <id>, user <id>, flags <...>
decisions:    <task>: <choice made and why>
skipped:      <task>: <blocker>

<project facts, as defined in /how-to-implement>
```

## Preflight, once

Propose the next useful group of PRs in merge order:

```
PR 1 — <title>  (tasks A1-A3, size M)
  One sentence: what it does and why it lands here.
  Validation: <how this PR will be tested>.
```

- Group tasks that must be reviewed together; split large efforts.
- Separate a backend contract from a frontend consumer that depends on it being merged.
  Read enough of the spec to identify this before proposing.
- Flag PRs blocked outside the repo, such as by an API owner, flag, or token.
- Choose how to validate each PR: unit tests, client-side with Playwright, server-side
  with a mirrored backend, or full e2e.

In the same `AskUserQuestion`, ask for sign-off, whether the developer will be AFK, and any
e2e inputs the validation scopes need (shared test account and user IDs, feature flags).
Write the answers and scopes to the run file, then start PR 1. Code is written only after
this approval.

## PR stack

Actively implement one PR at a time and keep completed PRs open as a stack. Use one
worktree for the whole stack, not one per PR.

Use the `gh stack` extension. Branch PR 1 from the target base, usually fresh
`origin/master`, with `gh stack init`. Add each later PR with `gh stack add`, which
branches from the previous PR and sets it as base.

For each PR, run `/how-to-implement` with:

- The plan reference and the PR's tasks.
- Blocker policy: `ask` in `present` mode, `skip` in `afk` mode.
- The run file as the project facts.
- Ship command: `gh stack submit`
- QA inputs: the PR's validation scope and the e2e inputs.

Copy its decisions and skipped tasks to the run file. Start the next PR as soon as the
previous one is submitted. After any PR merges, run `gh stack sync` before continuing.

## Finish

When every approved PR is submitted or blocked, report: PR links, decisions, skipped
tasks with blockers, open review findings, and QA verdicts with report paths.
