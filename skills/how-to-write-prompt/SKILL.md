---
name: how-to-write-prompt
description: Use when writing or editing a reused prompt: a skill, a system prompt, a CLAUDE.md, or an LLM prompt in product code.
user-invocable: true
---

# How to Write a Prompt

## Every prompt

- Keep it lean, clear, and concise. Every line earns its place.
- Write only what the model cannot know by itself. Skip common knowledge.
- State each rule in one place.
- Start a skill description with "Use when...".

## Behavior prompts

Most prompts describe behavior and expectations. For these:

- Assume a smart agent. Give it the goal, the expectations, and the guidelines, and let it choose how to reach them.
- Leave room to act. Skip examples and templates that would narrow the model's behavior to one shape.
- Keep the instructions few, so each one stays clear and relevant.
- Say what to do. Try to avoid saying what not to do.

## Procedure prompts

Some prompts run a technical procedure that happens the same way every time. For these:

- Structure the steps clearly, in order.
- Add a code snippet only when it is not obvious, such as an internal CLI command.
