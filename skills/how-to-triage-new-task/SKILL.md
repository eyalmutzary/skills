---
name: how-to-triage-new-task
description: Use when a new task comes in, to decide whether to implement it now, plan it first, or ask for clarification.
user-invocable: true
---

# How to Triage a New Task

A new task came in. Read it, then pick one path. The deciding question: how much room for error is there?

## Implement now

Small room for error. The task is small and straightforward: a small UI fix, a change in a few specific places, a small blast radius. You know what done looks like.

Implement it right away with `/how-to-implement`.

## Plan first

Large room for error. The task is complex, cross-repo, or touches a sensitive or legacy area. A wrong guess here is expensive.

Run `/how-to-plan`.

## Ask

You genuinely do not understand what the task asks for. Ask the user, then triage again.

When unsure between implement and plan, plan.

Tell the user the chosen path and the reason in one line, and continue.
