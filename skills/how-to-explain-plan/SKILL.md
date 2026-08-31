---
name: how-to-explain-plan
description: Explains implementation plans interactively, one step at a time, while tracking unclear areas, questions, and follow-ups. Use when the user asks to explain a plan, understand an approach, walk through proposed work, or review a plan before implementation.
---

# Explain a Plan

Help the user understand a proposed plan before work begins.

## Format

Start every plan with:

- **Title:** a short, descriptive name.
- **Goal:** one sentence describing the intended outcome.
- **Steps:** a numbered list with brief names only.

Then explain the first step. Do not explain later steps until the user confirms they understand the current one or asks to continue.

When adapting the explanation style, vary the method and structure—not only the phrasing. Use formats such as timelines, before/after comparisons, concrete examples, state transitions, diagrams, analogies, or question-and-answer when they clarify the concept.

Prefer simple visual flows for sequences and before/after comparisons for state changes. When useful, combine them: show the actions visually, then summarize their actual effect on the system.

For conditions, failures, or alternative outcomes, prefer a branching flow that shows where the paths split and where each path ends.

Use parallel lanes only when timing or interaction between concurrent actors matters, especially for race conditions and concurrency edge cases. Do not use them for ordinary sequential steps.

When several phases or components have different responsibilities, explain the question each one answers. Then state how their answers pass from one part to the next.

## Explain one step

For the current step:

- Begin with one plain-language essence sentence: **“This step is basically …”** Complete it with what the step accomplishes at the most practical level, before explaining details.
- Start with what will happen. Explain how it works, then explain why it matters.
- Do not lead with the problem or risk; establish the concrete action first.
- Explain the mechanism directly: say how the change produces the intended result.
- Prefer a short action sequence: the main change, its safeguard, then its user-visible result.
- Include enough implementation detail to make the safeguard credible, but omit lower-level ordering unless it changes the outcome.
- Use short bullets, not long paragraphs.
- Mention the relevant files, functions, components, or data only when they help the user understand the change.
- Assume the user understands the domain at a high level but may not know this code area's structure or names.
- Call out important assumptions, risks, trade-offs, or decisions before moving on.

End with a clear prompt to either ask questions or continue to the next step.

## Track understanding and follow-ups

Treat the conversation as part of the explanation:

- Pay attention to questions, corrections, repeated confusion, and areas where the user asks for more detail. Treat them as signals that those areas need a clearer explanation.
- Adapt later explanations to address those gaps. Revisit an earlier concept when understanding it is required for a later step.
- Track important notes under simple categories: unclear areas, assumptions to validate, possible plan changes, and follow-up investigations.
- When the user raises one, explicitly acknowledge it: briefly say what was noted and whether it is resolved or still open.
- Do not silently change the plan based on a note or question. Keep proposed changes separate until the user asks to update the plan.

At the end of the walkthrough, summarize:

- The key takeaways.
- The areas that needed extra clarification.
- Open assumptions or questions to validate.
- Possible changes or investigations the user identified.

Then ask whether the user wants to act on any open item, such as investigating it, validating an assumption, or updating the plan.

## Writing style

- Be concise, concrete, and straightforward.
- Prefer direct cause-and-effect wording: “This does X, so Y cannot happen.”
- Use simple, familiar terms before introducing implementation names.
- Prefer plain language over internal implementation detail.
- Include only information needed to understand the current step.
- When introducing a new name, choose a simple name that clearly describes what it represents.
