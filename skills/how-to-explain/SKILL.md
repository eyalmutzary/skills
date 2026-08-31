---
name: how-to-explain
description: Use when the user asks to explain a complicated topic concept, bug, gap, data flow, system behavior, or why something happened.
---

# Explain

Help the user understand a specific concept, issue, gap, flow, or system behavior.

For implementation plans or proposed work walkthroughs, use `how-to-explain-plan` instead.

## Format

Start every explanation with:

- **What:** a short name for the thing being explained (concept, issue, gap, or flow).
- **Essence:** one plain-language sentence: **“This is basically …”** Complete it at the most practical level before details.
- **Shape:** a brief outline of the pieces you will cover (e.g. expected flow → break → cause, or actors → sequence → outcomes). Keep names short.

Then explain the first piece. Do not dump the full explanation at once when the topic is long or multi-part. Pause after each piece until the user confirms they understand or asks to continue.

When adapting the explanation style, vary the method and structure—not only the phrasing. Use formats such as timelines, before/after comparisons, concrete examples, state transitions, diagrams, analogies, or question-and-answer when they clarify the idea.

Prefer simple visual flows for sequences and before/after comparisons for state changes. When useful, combine them: show the actions visually, then summarize their actual effect on the system.

For conditions, failures, or alternative outcomes, prefer a branching flow that shows where the paths split and where each path ends.

Use parallel lanes only when timing or interaction between concurrent actors matters, especially for race conditions and concurrency edge cases. Do not use them for ordinary sequential steps.

When several phases or components have different responsibilities, explain the question each one answers. Then state how their answers pass from one part to the next.

## Match the topic type

### Concept

- Start with what it is and what problem it solves.
- Then how it works at a high level.
- Then when it matters / when to use it.
- Introduce names only after the idea is clear.

### Flow

- Describe where data or control starts, where it moves, which services or components handle it, and which protocols connect them (REST, GraphQL, SQS, SNS, etc.).
- Prefer a short ordered sequence, then call out branches or side effects.
- For long or complicated flows, add a short diagram so order and relationships are easy to follow.

### Issue / bug

1. Expected flow (what should happen).
2. Where it breaks in that flow.
3. Why it happened (cause → effect).
4. Only then: impact or how to verify.

Do not lead with the root cause; establish the concrete expected behavior first.

### Gap

- State what exists today.
- State what is missing or incomplete.
- Explain the consequence of the gap (what cannot happen, or what fails silently).
- Keep proposed fixes separate unless the user asks for them.

## Explain one piece

For the current piece:

- Begin with one plain-language essence sentence when helpful: **“This part is basically …”**
- Start with what happens. Explain how it works, then explain why it matters.
- Prefer short bullets, not long paragraphs.
- Mentions of files, functions, components, or data only when they help understanding—optimize for how the system works, not for listing code locations.
- Assume the user knows the domain and broad architecture, but not this area’s structure or names.
- Call out important assumptions, edge cases, or trade-offs before moving on.

End with a clear prompt to either ask questions or continue to the next piece.

## Track understanding and follow-ups

Treat the conversation as part of the explanation:

- Pay attention to questions, corrections, repeated confusion, and requests for more detail. Treat them as signals that those areas need a clearer explanation.
- Adapt later pieces to address those gaps. Revisit an earlier idea when understanding it is required for a later piece.
- Track important notes under simple categories: unclear areas, assumptions to validate, open questions, and follow-up investigations.
- When the user raises one, explicitly acknowledge it: briefly say what was noted and whether it is resolved or still open.

At the end of the walkthrough, summarize:

- The key takeaways.
- The areas that needed extra clarification.
- Open assumptions or questions to validate.
- Any follow-ups the user identified.

Then ask whether the user wants to dig into any open item.

## Writing style

- Be concise, concrete, and straightforward.
- Prefer direct cause-and-effect wording: “This does X, so Y cannot happen.”
- Use simple, familiar terms before introducing implementation names.
- Prefer plain language over internal implementation detail.
- Include only information needed to understand the current piece.
- When introducing a new name, choose a simple name that clearly describes what it represents.
- Focus on the high-level process before tactical details.
