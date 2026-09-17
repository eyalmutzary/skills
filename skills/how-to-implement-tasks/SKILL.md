---
name: how-to-implement-tasks
description: Use when autonomously implementing an ordered task breakdown as a stack of reviewed and verified pull requests.
user-invocable: true
---

# How to implement tasks

Input: an unambiguous work breakdown with tasks, dependencies, sizes, and order. If any
of these is missing, stop and report what is missing.

## Contract

Re-read this section and the run file after every compaction and before every task.

1. **You orchestrate; sub-agents write code.** Every production and test change comes from
   an implementer agent, including review fixes, lint fixes, and one-line changes. Your own
   edits are limited to `/tmp` files, `gh stack` conflict resolution, and merging shared
   files (locales, barrel `index.ts`, generated types) collected from parallel implementers.
2. **Every task passes four gates in order:** implement → verify → review → manual
   validation. Commit after gate 4.
3. **One approval covers the whole batch.** After sign-off, the turn ends when every
   approved PR is submitted or recorded as blocked. Ask the developer only for a hard
   blocker (defined below), and only in `present` mode.
4. **In `afk` mode, decide, record, continue.** Every decision and skip goes in the run file
   and the final report.
5. **If a required agent or tool is unavailable, record the blocker and stop.** The work
   stays undone rather than done by you.

## Run file

Before PR 1, write `/tmp/<project>-run.md` and keep it current at every gate transition:

```
mode:         afk | present
approved:     PR 1 (A1-A3), PR 2 (B1-B2), ...
current:      PR 1 / task A2 / gate 3 review
agents:       implementer=<name>  reviewer=<name>
validation:   unit tests | Playwright | monday-mirror | full e2e
e2e inputs:   test account <id>, user <id>, flags <...>
decisions:    <task>: <choice made and why>
skipped:      <task>: <blocker>

node:         <output of `node -p process.execPath`>
test cmd:     <exact `scripts.test` from package.json, flags included>
typecheck:    <e.g. npx tsc --noEmit -p tsconfig.json>
lint:         <raw-output command>
dev server:   <type (Vite/webpack), port, URL that proves it compiled>
service kill: lsof -nP -iTCP:<port> -t | xargs kill
branch base:  <what to branch from>
```

Use `node -p process.execPath`; nvm is a shell function, so `which node` misleads. Derive
these facts once and read them from the file afterwards.

## Hard blockers and decisions

A **hard blocker** is one of: a destructive or irreversible choice, missing credentials or
access, an unavailable agent or tool, or a spec contradiction that changes user-visible
behavior. In `present` mode, ask with `AskUserQuestion`. In `afk` mode, skip the task,
record the blocker, and continue with the next task that does not depend on it.

Everything else is a **decision**: pick the safest reasonable option, record it, continue.

## Preflight, once

The user will provide you a breakdown of next possible tasks.
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
  with monday-mirror, or full e2e.

In the same `AskUserQuestion`, ask for sign-off, whether the developer will be AFK, and any
e2e inputs the validation scopes need (shared test account and user IDs, feature flags).
Write the answers and scopes to the run file, then start PR 1. Code is written only after
this approval.

## PR stack

Actively implement one PR at a time and keep completed PRs open as a stack. Within a PR,
run tasks in dependency order and finish one before starting the next.

Use the `gh stack` extension. Branch PR 1 from the target base, usually fresh
`origin/master`, with `gh stack init`. Add each later PR with `gh stack add`, which
branches from the previous PR and sets it as base. Start the next PR as soon as the
previous one is submitted. After any PR merges, run `gh stack sync` before continuing.

## Task loop

### Gate 1: Implement

Create `/tmp/<project>-<task>-review.md`, the shared review thread, and include its path
in every implementer and reviewer prompt. All reviewer↔implementer communication goes
through this file, so the code stays free of review remarks:

```
## R1 (reviewer)
1. <file:line> <finding>
## R1 (implementer)
1. fixed in <commit/diff area> | declined: <one-line reason>
```

Spawn one Sonnet sub-agent implementer with:

- The single task ID and its **invariants**, not only its task text.
- Exact typecheck, scoped-test, and lint commands from the run file.
- The `how-to-write-code` and `/mattpocock-skills:implement` skills.
- Its owned files. For parallel agents, name each and give each exclusive files; shared
  files (locales, barrels, generated types) are collected and merged by you.
- "Run scoped tests only; the full suite runs once at ship time."
- "Report as structured facts: files changed, tests added, open questions."
- "Answer review findings in the review thread file; the code carries only the fix."

### Gate 2: Verify

Check every claim yourself:

```bash
grep -rn "<the symbol it claims it added>" <path>
git diff --stat
<typecheck>  &&  <scoped tests>  &&  <lint on changed files only>
```

**Mutation-test at least one new test:** `cp file file.bak`, break the tested line, confirm
red, restore from `.bak`.

### Gate 3: Review

Spawn an Opus reviewer with `/mattpocock-skills:code-review` on the task's **uncommitted**
diff. It appends numbered findings to the review thread and returns.

Per round: implementer reads the thread and fixes or appends a concise response → you
re-run gate 2 → reviewer rereads the thread, rechecks the changed area, appends a verdict.
Serialize writes; pass turns by telling the agent the thread changed, without relaying its
contents. Cap at 3 rounds; past that, continue only for a major finding and record skipped
minor findings as decisions.

### Gate 4: Manual validation, smallest sufficient scope

- Pure logic without I/O: gate 2 is sufficient.
- Server only: call the real endpoint and read real logs.
- Client only: a real browser against a real backend; jsdom does not count.
- Cross-layer contract: full e2e.

For a live backend or browser, read and follow
`~/.claude/skills/how-to-debug-e2e/SKILL.md`, using the `e2e inputs` from the run file.
Keep the mirror running between consecutive tasks that need it.

Commit, update `current` in the run file, and start the next task.

## Ship a PR

After the last task of a PR: `git fetch` first, since bots may push to the branch. Stage
named files and check the staged list for scratch files, `.bak` files, temporary hacks,
and secrets. Title `[PR n] ...` with one bullet per task.

`gh stack submit` pushes every branch and creates or updates each PR with the right base.

Run the **full test suite once, here**. Before fixing red CI, confirm the check is green
on the base branch. Then start the next approved PR.

## Finish

When every approved PR is submitted or blocked, report: PR links, decisions, skipped
tasks with blockers, and open review findings.

## Agent heartbeat

The prompt cache TTL is **5 minutes**.

- While a sub-agent works, call `ScheduleWakeup` every 240s (stay below 270s). Each heartbeat runs only `ListAgents` and `git diff --stat`.
- Keep heartbeat prompts short and point to the run file.
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
- Kill by tracked PID; `pkill -f` in a shared tree kills other agents' runs.
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
