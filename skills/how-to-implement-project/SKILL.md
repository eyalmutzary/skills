---
name: how-to-implement-project
description: Drive a multi-PR implementation of an existing work breakdown, autonomously, using implementer/reviewer sub-agents and real verification. Propose the next 5 PRs, get sign-off, then ship them one at a time. Use when a project already has a task breakdown with dependencies and order, and the ask is to build it. TRIGGER on "implement the project", "work through the breakdown", "ship the next PRs", "run the implementation loop".
user-invocable: true
---

# How to implement a project

**Pre-requisite:** a work breakdown already exists — tasks, dependencies, sizes, order.
This skill covers only the build. If the breakdown is missing or ambiguous, stop and say so.

**Non-negotiable:** one PR in flight at a time. Finish it before starting the next.

## 1. Propose the next 5 PRs

Read the breakdown for dependency order and sizes. If a live tracker exists (Monday, Jira,
Linear), cross-reference it — the doc has order, the tracker has status, neither alone is enough.

Then list **exactly 5 PRs**, numbered so the merge order is obvious:

```
PR 1 — <title>  (tasks A1-A3, size M)
  One sentence: what it does and why it lands here.
```

Rules for bundling:
- Group tasks that only make sense reviewed together. Split a large effort across PRs.
- Never bundle a backend contract and its frontend consumer if the frontend needs the
  contract merged first. Read the spec far enough to catch this **before** proposing.
- Flag any PR that is blocked on something outside the repo (an API owner, a flag, a token).

Then ask for sign-off with `AskUserQuestion`. **Do not write code before approval.**

## 2. Pin the environment — once

Before the first PR, resolve these and write them to `/tmp/<project>-facts.md`:

```
node:        <output of `node -p process.execPath`>   # `which node` lies; nvm is a shell function
test cmd:    <the exact `scripts.test` from package.json, flags included>
typecheck:   <e.g. npx tsc --noEmit -p tsconfig.json>
lint:        <the raw-output form, see Gotchas>
dev server:  <type (Vite/webpack), port, the URL that proves it compiled>
service kill: lsof -nP -iTCP:<port> -t | xargs kill
branch base: <what to branch off — see Gotchas>
```

Re-read this file after every compaction. Never re-derive these facts.

## 3. The loop, per PR

### 3a. Branch

Branch off whatever the project's convention is — usually fresh `origin/master`. If the
chain is unmerged and stacked, branch off the previous PR's branch and set `--base` to it.
Decide once, record it in the facts file, stay consistent.

### 3b. Implementer sub-agent (Sonnet)

Spawn one named implementer. Its prompt must carry:
- The task IDs and the **invariants**, not just the task text.
- The exact typecheck / scoped-test / lint commands from the facts file.
- The repo's code-style skill (`how-to-write-code`) and `/mattpocock-skills:implement`.
- **Files it owns.** If agents run in parallel, name them, and forbid shared files
  (translation/locale files, barrel `index.ts`, generated types). Collect those yourself.
- "Do not run the full test suite." Scoped tests only.
- "Report: files changed, tests added, open questions." Not a narrative.

### 3c. Verify the implementer yourself

Never accept "all green". Every time:

```bash
grep -rn "<the symbol it claims it added>" <path>   # it reports files it never wrote
git diff --stat
<typecheck>  &&  <scoped tests>  &&  <lint on changed files only>
```

Then **mutation-test at least one new test**: `cp file file.bak`, break the source line,
confirm the test goes red, restore from the `.bak`. A test that cannot fail is worse than none.

### 3d. Reviewer sub-agent (Opus)

Review the **uncommitted** diff — before commit, not after. Use
`/mattpocock-skills:code-review`. Tell it to report findings **incrementally**, not in one
final dump, and never block waiting on it.

Findings → implementer fixes → you re-verify (3c) → reviewer re-reviews the changed part only.

### 3e. Manual verification — pick the smallest scope that proves it

| Change touches | Verify with |
|---|---|
| Pure logic, no I/O | Scoped tests + mutation test. Nothing more. |
| Server only | Call the real endpoint. Read the real logs. |
| Client only | Real browser against a real backend. jsdom does not count. |
| A contract across both | Full e2e. |

For anything needing a live backend or a real browser, use **`/how-to-debug-e2e`** — it owns
mirror startup, headers, browser flags, and log reading. Two notes when calling it from here:
- Run it in a **forked sub-agent**. Mirror boot, browser driving, and log tails are huge;
  the fork returns a verdict and keeps the noise out of your context.
- Do not tear the mirror down between consecutive PRs that both need it. Each boot costs a minute.

### 3f. Ship

`git fetch` first — bots push to your branch. Stage named files, never `git add -A`/`.`.
Check the staged list for scratch files, `.bak` files, and secrets. Open the PR with the
number in the title (`[PR 3] ...`) and a bullet per task.

Run the **full test suite once**, here, at the end — not during the loop.

Before fixing any red CI check, confirm it is green on the base branch. Chasing a check that
was already red is pure waste.

## 4. Heartbeat and the 5-minute cache

The prompt cache TTL is **5 minutes**. Going past it means the next turn re-reads the whole
context uncached — slow and expensive. So:

- **Heartbeat every 240s** while a sub-agent is working. It checks the agent *and* keeps the
  cache warm. `ScheduleWakeup` with `delaySeconds: 240`.
- **Never 300s.** It is the worst number — you pay the cache miss without buying a longer wait.
  Either stay under 270s, or commit to 1200s+.
- **Never `sleep` in bash to wait.** A `sleep 270; echo tick` burns a whole turn for nothing.
- To wait on a *known* job, block in **one** turn: `while kill -0 $PID 2>/dev/null; do sleep 5; done; tail -40 /tmp/out.log`
- Each heartbeat: `ListAgents`, then `git diff --stat`. That is all.
- **Escalate, don't repeat.** Two heartbeats with no file change → `SendMessage` the agent
  asking for status. Two more with no reply → send one blocking *"stop, or confirm you own
  this"* message, wait for the answer, then take over. Never take over silently.
- Keep the heartbeat prompt short and point at the facts file. Do not re-write the full
  project state into every wakeup.

## Common mistakes

**Waiting**
- Piping a long run through `tail` — output buffers, the file stays empty, and the job looks
  hung. Redirect to a file, then tail the *file*. This faked a 35-minute hang.
- Polling with `sleep`. See §4.

**Sub-agents**
- Calling `Agent` again with an existing agent's name **spawns a second agent**. To continue
  one, use `SendMessage`. A duplicate agent once edited a file blind, got killed mid-edit, and
  left corruption the real agent reported as a mystery conflict.
- `pkill -f "<pattern>"` in a shared tree kills other agents' runs. Kill by tracked PID only.
- Editing files an agent is still editing. Ask first (§4).
- Delegating a single-document lookup. That is a `Read`, not an agent.
- Asking for a narrative report you will not read, because you will re-read the code anyway.

**Guessing**
- **Two failed guesses is a hard stop.** Then read the config, the README, or the thing's own
  output. Guessed bundle URLs cost ~20 curl probes; the browser's network log gave the answer
  in one. Guessed test commands cost 4 turns; `package.json` had the missing flag.
- Types cannot tell you what a runtime throws. Log it at runtime.
- `ls` the directory before `sed`/`grep` on a file you have not read. `.ts` vs `.tsx` and
  file-vs-directory mistakes each cost a turn.

**Shell**
- Relative `cd` — the cwd resets between calls. Absolute paths only.
- Unquoted globs: write `--include='*.ts'`, or use the `Grep` tool.
- Scope greps to a directory; a bare `grep -r` over a monorepo hits the timeout.

**Protecting the tree**
- Restoring a mutation test with `git checkout` reverts the **whole file** and wipes unrelated
  edits. Restore from a `cp` backup of that one file.
- Scratch docs go to `/tmp` from birth, never into the tree you are about to commit.
- Log every temporary hack (a forced flag, a stubbed endpoint) to a list the moment you make
  it, and diff the list before staging.

**Diagnosing**
- Do not announce a root cause before you have tested it. Say "hypothesis", run the cheapest
  falsifying probe, then speak. Three wrong confident diagnoses cost three round-trips.
- Before blaming your change, prove the failure is new: `git show <base>:<file> | grep <thing>`.
- Suspect your own harness before the product. A "scroll not preserved" failure was Playwright
  scrolling a button into view.
- Separate flaky from real by re-running the failing suites alone with `--runInBand`.
