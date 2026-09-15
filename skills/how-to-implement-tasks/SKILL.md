---
name: how-to-implement-tasks
description: Use when autonomously implementing an ordered task breakdown as a stack of reviewed and verified pull requests.
user-invocable: true
---

# How to implement tasks

Requires an unambiguous work breakdown with tasks, dependencies, sizes, and order.
Otherwise, stop and report what is missing.

The process has two layers:

- **Task iteration:** implement, verify, review, and manually validate one task.
- **Loop rules:** choose and order work, manage PR boundaries and agents, ship, then repeat.

## Loop rules

### Plan the next PRs

Read the breakdown for order and sizes. Cross-reference any live tracker (Monday, Jira,
Linear): the breakdown provides order; the tracker provides status.

Propose the next useful group of PRs in merge order.

```
PR 1 — <title>  (tasks A1-A3, size M)
  One sentence: what it does and why it lands here.
```

- Group tasks that must be reviewed together; split large efforts.
- Separate a backend contract from a frontend consumer that depends on it being merged.
  Read enough of the spec to identify this before proposing.
- Flag PRs blocked outside the repo, such as by an API owner, flag, or token.

Ask for sign-off with `AskUserQuestion`. **Do not write code before approval.**

Also ask if the developer will be AFK during implementation. If so, stop asking questions: skip anything unclear when possible, and report every skip at the end.

### Build a PR stack, one PR at a time

Actively implement only one PR at a time, but keep multiple completed PRs open as a stack.
Within each PR, run tasks in dependency order and finish one before starting the next.

Use the `gh stack` extension (`gh stack init`, `gh stack add`, `gh stack submit`) instead
of managing branches and bases by hand. Branch PR 1 from the target base, usually fresh
`origin/master`, with `gh stack init`. Add every later PR on top with `gh stack add`, which
branches it from the previous PR's branch and sets that branch as its base. Do not wait
for earlier PRs to merge before building the next one. After any PR in the stack merges,
run `gh stack sync` (or `gh stack rebase`) before continuing, instead of rebasing by hand.

### Pin the environment once

Before PR 1, write these to `/tmp/<project>-facts.md`:

```
node:        <output of `node -p process.execPath`>
test cmd:    <the exact `scripts.test` from package.json, flags included>
typecheck:   <e.g. npx tsc --noEmit -p tsconfig.json>
lint:        <the raw-output command>
dev server:  <type (Vite/webpack), port, the URL that proves it compiled>
service kill: lsof -nP -iTCP:<port> -t | xargs kill
branch base: <what to branch from>
```

Use `node -p process.execPath`, not `which node`; nvm is a shell function. Re-read the
facts after every compaction; never re-derive them.

### Ship after all PR tasks are complete

Run `git fetch` first because bots may push to the branch. Stage named files, never
`git add -A` or `git add .`. Check staged files for scratch files, `.bak` files, and
secrets. Use `[PR 3] ...` in the title and include one bullet per task.

Push and open the PR with `gh stack submit`, run from anywhere in the stack; it pushes
every branch and creates or updates each PR with the right base automatically.

Run the **full test suite once**, here. Before fixing red CI, confirm the check is green
on the base branch. Then continue with the next approved PR.

## One task iteration

### 1. Delegate

Spawn one named Sonnet implementer. Include:

- The single task ID and its **invariants**, not only its task text.
- Exact typecheck, scoped-test, and lint commands from the facts file.
- `how-to-write-code` and `/mattpocock-skills:implement` skills.
- Owned files. If a task uses parallel agents, name each agent and forbid shared files
  such as locales, barrel `index.ts` files, and generated types; collect those yourself.
- "Do not run the full test suite." Scoped tests only.
- "Report: files changed, tests added, open questions." Not a narrative.

### 2. Verify independently

Never accept "all green" without checking:

```bash
grep -rn "<the symbol it claims it added>" <path>
git diff --stat
<typecheck>  &&  <scoped tests>  &&  <lint on changed files only>
```

**Mutation-test at least one new test:** back up the source with `cp file file.bak`,
break the tested line, confirm red, then restore from `.bak`.

### 3. Review before commit

Have an Opus sub-agent reviewer inspect the task's **uncommitted** diff with
`/mattpocock-skills:code-review`. Request incremental findings and do not block waiting.

For each finding: implementer fixes → independent verification → reviewer rechecks only
the changed area. Cap this cycle at 3 rounds. Past that, keep going only for a major
finding; skip remaining minor/style findings and move on.

### 4. Manually verify the smallest sufficient scope

- Pure logic without I/O: scoped tests plus mutation test.
- Server only: call the real endpoint and read real logs.
- Client only: use a real browser against a real backend; jsdom does not count.
- Cross-layer contract: run full e2e.

For a live backend or browser, run **`/how-to-debug-e2e`** in a forked sub-agent so only
its verdict returns. Keep the mirror running between consecutive tasks that need it.

The task is complete only after implementation, independent verification, review
findings, and required manual verification are all complete.

## Agent heartbeat

The prompt cache TTL is **5 minutes**.

- While a sub-agent works, call `ScheduleWakeup` every 240s, never 300s. Stay below
  270s or wait 1200s+. Each heartbeat runs only `ListAgents` and `git diff --stat`.
- Keep heartbeat prompts short and point to the facts file.
- Never wait with bash `sleep`. For a known PID, block in one turn:
  `while kill -0 $PID 2>/dev/null; do sleep 5; done; tail -40 /tmp/out.log`.
- After two heartbeats without file changes, `SendMessage` for status. After two more
  without a reply, send one blocking "stop, or confirm you own this" message, await the
  answer, then take over. Never take over silently.

## Common mistakes

### Waiting and sub-agents

- Redirect long-running output to a file, then tail the file; piping through `tail` may
  buffer and look hung.
- Do not poll with `sleep`; follow the heartbeat rules.
- Calling `Agent` with an existing name spawns another agent. Use `SendMessage`.
- `pkill -f "<pattern>"` in a shared tree kills other agents' runs. Kill by tracked PID only.
- Ask before editing files an agent still owns.
- Read single documents directly; do not delegate them.
- Request structured facts, not narrative reports you will not use.

### Investigation

- **After two failed guesses, stop guessing.** Read config, README, or actual output.
- Types cannot tell you what a runtime throws. Log it at runtime.
- List the directory before `sed` or `grep` on an unread path.
- Do not announce a root cause before testing it. State a hypothesis and run the
  cheapest falsifying probe.
- Prove a failure is new before blaming the change:
  `git show <base>:<file> | grep <thing>`.
- Suspect the harness before the product.
- Distinguish flakes by rerunning failing suites alone with `--runInBand`.

### Shell and tree safety

- Use absolute paths; the cwd may reset between calls.
- Quote globs (`--include='*.ts'`) or use `Grep`; scope searches to a directory.
- Restore mutation tests from the `cp` backup, never `git checkout`, which may erase
  unrelated edits in the file.
- Scratch docs go to `/tmp` from birth, never into the tree you are about to commit.
- Log temporary hacks when introduced and diff the list before staging.
