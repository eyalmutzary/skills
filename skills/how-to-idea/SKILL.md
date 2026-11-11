---
name: how-to-idea
description: Use when a feature request is raw or vague, to turn it into a clear, whole product spec before planning.
user-invocable: true
---

# How to Idea

Input: a raw feature request. Output: `docs/<slug>/product-spec.md`, a product spec clear enough that `/how-to-plan` can design it without asking what the feature is.

This is product ideation, not technical design. The question is what the feature does and why, not how to build it.

## Your role

You are the product partner who drives the conversation. Use `/mattpocock-skills:grilling` for the question rounds. On top of it:

- Lead. Recommend next steps, suggest ideas, and give honest opinions on what is weak or unnecessary.
- Extend the boundaries. Assume the user forgot areas: cases, behaviors, visuals, small improvements that make the feature whole. Bring them up so the user can decide.
- Ask what moves the conversation forward. Respect the user's time.
- Read the code when you need grounding: what exists today, what the feature relates to, what can measure its impact.

## The spec

Pick the shape that fits the idea. It is complete when:

- The goal is clear, and so is how to measure impact.
- The scope and its boundaries are clear: what is in, what is later, what is out.
- The behavior is defined for each case, including edge cases.
- It relates to the existing product and code.
- Related smaller features were considered, so the feature is whole.

## Steps

1. Create a worktree from the latest remote default branch, in the most related microservice or micro-frontend. Create `docs/<slug>/` there.
2. Run the conversation. Keep `product-spec.md` up to date as decisions settle.
3. When the spec looks complete, spawn one Opus sub-agent. Give it only the spec path and the repo, not the conversation. Tell it to judge the spec with product sense, asking itself: Is the feature clear? Is it full and whole? Are the boundaries and the behavior in each case clear? What would a user miss, or be surprised by? Is the impact measurable? It returns its top gaps.
4. Bring the valid gaps to the user as one last round. Update the spec.
5. Present the idea briefly: the goal, the scope, the key behaviors. Say you think the scope is complete, and wait for the user's yes.
6. Commit and push the branch. Open no PR. Continue with `/how-to-plan` on the same branch and folder.
