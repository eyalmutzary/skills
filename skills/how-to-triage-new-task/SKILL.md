---
name: how-to-triage-new-task
description: Use when a new task comes in, to decide whether to implement it now, plan it first, shape the idea first, or ask for clarification.
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

## Idea first

The "what" still has not entirely clear: the scope, the behavior, or the goal is vague. Building or planning now would mean guessing multiple parts of the task.

Run `/how-to-idea`. It continues to `/how-to-plan`, then to implementation.

## Ask

A small fact is missing, such as which board or which environment. Ask the user, then triage again.

When unsure between implement and plan, plan.

Tell the user the chosen path and the reason in one line, and continue.
