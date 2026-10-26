---
name: how-to-implement
description: Use when implementing any code change, from a small fix to a PR-sized chunk of a plan, as a reviewed and verified pull request.
user-invocable: true
---

# How to implement

Input: the change to make. Usually a plan reference and the tickets that fit one PR; sometimes a direct request.
Output: a pushed PR. If the branch already has a PR, the new commits are pushed to it.

Before you start, know for each ticket its **intent**, its **invariants** (what must stay true), and **done when**. Find them in the plan, spec, and tickets. If you still do not understand the change, ask.

The caller can set:

- **Blocker policy**: `ask` (default) or `skip`.
- **Project facts**: a file with them. Default: derive them yourself.
- **Branch**: where to work. Default: a new worktree per `CLAUDE.md`.
- **Ship command**: default `gh pr create`; a stack passes `gh stack submit`.
- **QA inputs**: validation scope and e2e inputs (test account, user, flags).

## Contract

Re-read this section after every compaction and before every ticket.

1. **You orchestrate; sub-agents write code.** Every production and test change comes from
   an implementer agent, including review fixes, lint fixes, and one-line changes. Your own
   edits are limited to `/tmp` files, conflict resolution, and merging shared files
   (locales, barrel `index.ts`, generated types) collected from parallel implementers.
2. **Every ticket passes four gates in order:** implement → verify → review → QA.
   Commit after gate 4.
3. **Only implementers run checks.** Typecheck, tests, and lint are slow. Implementers run
   them; you and the reviewer read their checks log.
4. **If a required agent or tool is unavailable, it is a hard blocker.** The work stays
   undone rather than done by you.

## Hard blockers and decisions

A **hard blocker** is one of: a destructive or irreversible choice, missing credentials or
access, an unavailable agent or tool, or a spec contradiction that changes user-visible
behavior. With `ask`, ask with `AskUserQuestion`. With `skip`, skip the ticket, record
the blocker, and continue with the next ticket that does not depend on it. List skipped
tickets in the PR description and the report.

Everything else is a **decision**: pick the safest reasonable option, record it, continue.
List the decisions in the PR description.

## Project facts

If you have a worker id, add it to every `/tmp` file name and to the `qa-base` worktree name.

Derive these once into `/tmp/<project>-facts.md`, unless the caller gave them, and read
them from the file afterwards:

```
node:         <output of `node -p process.execPath`>
test cmd:     <exact `scripts.test` from package.json, flags included>
typecheck:    <e.g. npx tsc --noEmit -p tsconfig.json>
lint:         <raw-output command>
dev server:   <type (Vite/webpack), port (from your port slot if you have one; set it in your worktree's dev-server config and never commit it), URL that proves it compiled>
service stop: <kill the PID you recorded when you started it>
branch base:  <what to branch from>
```

Use `node -p process.execPath`; nvm is a shell function, so `which node` misleads.

## Ticket loop

Run the tickets in dependency order. Finish one before you start the next.

### Gate 1: Implement

Create `/tmp/<project>-<ticket>-review.md`, the shared review thread, and include its path
in every implementer and reviewer prompt. All reviewer↔implementer communication goes
through this file, so the code stays free of review remarks:

```
## R1 (reviewer)
1. <file:line> <finding>
## R1 (implementer)
1. fixed in <commit/diff area> | declined: <one-line reason>
```

Spawn one Sonnet sub-agent implementer with:

- The single ticket and its **invariants**, not only its text.
- Exact typecheck, scoped-test, and lint commands from the facts file.
- The `how-to-write-code` and `/implement` skills.
- Its owned files. For parallel agents, name each and give each exclusive files; shared
  files (locales, barrels, generated types) are collected and merged by you.
- "You alone run typecheck, tests, and lint. They are slow: scope them to your change and
  run them once per finished change set. Append each command, its exit code, and the
  output tail to `/tmp/<project>-<ticket>-checks.log`."
- "Mutation-test at least one new test: `cp file file.bak`, break the tested line, confirm
  red, restore from `.bak`. Log it in the checks log."
- "Report as structured facts: files changed, tests added, open questions."
- "Answer review findings in the review thread file; the code carries only the fix."

### Gate 2: Verify

Check every claim against the tree and the checks log:

```bash
grep -rn "<the symbol it claims it added>" <path>
git diff --stat
cat /tmp/<project>-<ticket>-checks.log   # zero exit codes, one red mutation run
```

### Gate 3: Review

Spawn an Opus reviewer with `/mattpocock-skills:code-review` on the ticket's **uncommitted**
diff. It reviews by reading the code and the checks log, appends numbered findings to the
review thread, and returns.

Per round: implementer reads the thread and fixes or appends a concise response → you
re-run gate 2 → reviewer rereads the thread, rechecks the changed area, appends a verdict.
Serialize writes; pass turns by telling the agent the thread changed, without relaying its
contents. Run at least one round, at most two. Record minor findings left open as
decisions; a major finding left open is a hard blocker.

### Gate 4: QA

Only the user can waive QA. When QA ends, add one line to the review thread:
`QA: <report path>`, or `QA waived by user: <their words>`. Master workers cannot ship
without it.

Spawn a Sonnet QA agent with `/how-to-QA`, the mode, the ticket's intent and invariants, and
the QA inputs. For later tickets in the same PR, `SendMessage` the same QA agent, so its
mirror and dev server stay up.

On `FAIL`, or a gap worth fixing, append the QA findings to the review thread:

- Small, local fix: implementer → gate 2 → QA rechecks the failed checks.
- Larger fix: implementer → gates 2 and 3 → QA.

Cap at 2 QA rounds; past that, record the open findings in the PR description.

Commit and start the next ticket.

## Ship

After the last ticket: `git fetch` first, since bots may push to the branch. Stage
named files and check the staged list for scratch files, `.bak` files, temporary hacks,
and secrets. One bullet per ticket in the PR description, plus the decisions and the QA
verdict.

An implementer runs the **full test suite once, here**. Then push with the ship command.
Before fixing red CI, confirm the check is green on the base branch.

Report: the PR link, decisions, skipped tickets, open review findings, and the QA verdict with its report path.

## Gotchas

- If the PR adds a new feature flag, also create the flag in your feature-flag system.

### UI

- If Figma does not show how the new part sits next to existing UI (overlap, gap, alignment), that is a decision. Tell the caller. Never write your guess into implementer or QA prompts as the spec.
- Give QA the Figma link and the intent, not your own numbers as pass criteria.
- With a Figma design: before the build, use `/how-to-match-figma` to write the spec, and give its path to the implementer. After each build round, use `/how-to-match-figma` again and give the implementer the gap list.

## Agent heartbeat

The prompt cache TTL is **5 minutes**.

- While a sub-agent works, call `ScheduleWakeup` every 240s (stay below 270s). Each heartbeat runs only `ListAgents` and `git diff --stat`.
- Keep heartbeat prompts short and point to the review thread or the caller's run file.
- For a known PID, block in one turn instead of polling:
  `while kill -0 $PID 2>/dev/null; do sleep 5; done; tail -40 /tmp/out.log`.
- After two heartbeats without file changes, `SendMessage` for status. After two more
  without a reply, send one blocking "stop, or confirm you own this" message, await the
  answer, then take over and record it.

## Lessons from past runs

### Sub-agents

- Redirect long-running output to a file, then tail the file; piping through `tail` may
  buffer and look hung.
- Message a live agent with `SendMessage`; `Agent` with an existing name spawns a second one.
- Kill by tracked PID; a global kill in a shared tree kills other agents' runs.
- Ask an agent before editing files it still owns.
- Read single documents yourself; delegate work, not reading.

### Investigation

- After two failed guesses, read config, README, or actual output.
- Log at runtime to learn what a call throws; types describe the happy path.
- List a directory before running `sed` or `grep` on an unread path.
- State a hypothesis and run the cheapest falsifying probe before naming a root cause.
- Prove a failure is new before blaming the change: `git show <base>:<file> | grep <thing>`.
- Suspect the harness before the product.
- Rerun a failing suite alone with `--runInBand` to distinguish a flake.

### Shell and tree safety

- Use absolute paths; the cwd may reset between calls.
- Quote globs (`--include='*.ts'`) or use `Grep`; scope searches to a directory.
- Restore mutation tests from the `.bak` copy; it preserves unrelated edits in the file.
- Scratch docs live in `/tmp` from birth.
- Log temporary hacks when introduced and diff the list before staging.
