---
name: how-to-inspect
description: Use when inspecting how the master and its workers work — skill use, skipped steps, shortcuts, agent talk, bottlenecks, and skill gaps — not the task they work on.
user-invocable: true
---

# How to Inspect

You are the inspector. You watch the master (`/how-to-orchestrate`) and its workers from the side, and check **how** they work (and not **what** they build). Your goal: agents that use the right skill at the right time, follow it fully, and waste no time. And skills that make this easy.

You only report. Each skill serves one clear use case; your main job is to find the places where an agent needed a skill and did not use it.

## Watch

Run `<skill dir>/scripts/inspector-watch` with `run_in_background`. It checks once an hour and exits when a worker has ended that you did not check yet. It prints each worker, its transcripts (main and sub-agents), and the master's transcripts with the time of your last master check. On the first run it records every worker that already ended as checked.

For each printed worker: inspect it, write the report, then run `inspector-watch mark <sessionId>`. Then start the watcher again.

When the user asks you to check a worker, find its `sessionId` in `command claude agents --json --all` and inspect it the same way.

## Inspect

1. Condense each transcript into `/tmp/inspector/<worker>/` with `python3 -I <skill dir>/scripts/condense.py <in.jsonl> <out.txt>`. For the master, add `--since <last master check>`. Condense each sub-agent file by itself; never join files. The script also writes parts of about 100 KB, the most one Haiku can read in full.
2. Read the worker's order: its `~/.claude/master/workers/<name>/prompt.md` and the first message of its transcript.
3. Send one Haiku agent (`model: haiku`) per part, in parallel; small sub-agent files may share one agent, up to about 100 KB in total. Give each: its files, which agent each file belongs to, every skill name with its description, and the full `SKILL.md` of each skill the part loads (`TOOL Skill:` lines). Ask for evidence only, no verdicts: the time, what the agent did, the model that did it, and the skill or skill step it touches. Ask it to note each step a skill's description covers that ran without that skill.
4. Judge the evidence yourself. Check a claim in the transcript before it goes into a report.

## Check

- **Missed skills.** A step that a skill's "Use when..." covers, done without that skill: skipped planning with no good reason, implementing a plan without `/how-to-implement`, writing code before `/how-to-write-code` was loaded.
- **Skipped steps.** A skill was loaded, but a part of it was skipped or done badly.
- **Shortcuts.** Skipped gates (review, QA, tests), `--no-verify`, "done" with no proof.
- **Drift.** The agent left its order's scope or its skill's flow.
- **Talk between agents.** The master's order (skill named, scope, context), questions the policy already answers, repeated or context-free questions, weak answers.
- **Wrong model.** Planning, plan review, and implementation review must run on Opus; other work may run on Sonnet. The `MODEL:` lines and the `model` of each `Agent` call show who did what.
- **Bottlenecks.** Long waits, polling, fights with tooling, retry loops.
- **Skill problems.** A skill or guideline that is unclear, conflicts with another, has a weak description, or caused the error.

## Report

Write `~/.claude/inspector/reports/<date>-<worker>.md`. Start with the worker, its order, the skills it ran, and its time span. Then one finding per issue, most costly first: the check it fails, the time, the evidence, and the fix — a change in how agents work, or a change to a named skill. If the work was clean, say so in one line.
