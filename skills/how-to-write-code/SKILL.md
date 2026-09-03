---
name: how-to-write-code
description: Use when writing any code
---

# How to Write Code

## Overview

Write top-down code: a short public flow followed by details. Optimize
for readability and correctness, not minimum line count.

For frontend or React work, **REQUIRED REFERENCE:** read
[frontend.md](frontend.md).

## Preferred code shape

### Files

- Keep one cohesive concept per file.
- Put every type, interface, and enum in `types.ts` in the same folder,
  including declarations used by only one implementation file.
- Keep up to two constants beside their implementation. With more than two,
  move all constants to `constants.ts`.
- Name semantic values, including zeroes, limits, statuses, and event names.
- Put the exported entry point first and private helpers below.
- Add `index.ts` only for folders with multiple files. Export explicit public
  symbols; never use `export *`.

### Functions

- Shape exported orchestration as roughly 10–25 lines and 3–5 domain stages.
- The functions in the file should be ordered by level of abstraction, keeping the public/exported ones on top.
- Give each helper one cohesive responsibility and one abstraction level.
- Extract a helper when it names a meaningful stage or hides substantial logic.
- Extract loops from exported orchestration into named helpers.
- When a validation coordinator contains multiple non-trivial checks, keep the
  coordinator and delegate each concern to a focused helper.
- Group related persistence, event, and logging operations when they make the
  entry point long.
- Name non-straightforward checks as `const` booleans (null checks can stay
  inline). When composing several, add one more `const` for the overall
  decision in plain English, and put only that name in the `if`.

```ts
const isTheExpectedTurn = latestTurn?.turnId === expectedTurnId;
const isLatestTurnStillRunning = latestTurn?.status === 'running';

const shouldKeepExistingState =
  latestTurn === null || !isTheExpectedTurn || isLatestTurnStillRunning;

if (shouldKeepExistingState) {
  return state;
}
```

- Keep an obvious call or small object literal inline; do not hide it behind a
  forwarding helper.
- Prefer guard clauses and a visible happy path over nesting.
- Prefer named option objects over unclear positional flags.
- Split long collection chains into named intermediate values.

### Names and formatting

- Use explicit, searchable domain names.
- Avoid nested ternaries and compressed expressions that need decoding.
- Use blank lines to separate stages of work.

### Type safety — strict

- Never use `any`, including `as any`. Model the type, or use `unknown` and
  narrow it safely.
- Never use `@ts-ignore`, `@ts-expect-error`, or `@ts-nocheck`.
- Never force incompatible types with casts such as `as unknown as SomeType`.
- Do not weaken TypeScript compiler rules. Fix the type definition, validate
  external data, or add a typed adapter.
- If there is no way around it - mention me you've done it and briefly explain why.

### Comments

- Default: no comments. Names, helpers, and blank lines explain the code.
- Allowed (uncommon): one short line for a decision or external constraint the code
  cannot show.
- Rare: A comment longer than one or two short sentences.
  Prefer fixing the name or structure to better explain itself. Write more only when the constraint
  is still invisible after that, and keep it as short and clear as it can be.

### Errors

Log immediately before every throw and reuse one message:

```ts
const errorMessage = `Customer ${customerId} was not found`;
logger.error(errorMessage);
throw new Error(errorMessage);
```

## Size signals

Review rather than automatically extract when code crosses these signals:

- Exported entry point above roughly 25 lines: extract a cohesive domain stage.
- Helper above roughly 25 lines: check whether it contains multiple stages.
- Nesting beyond two levels: try guard clauses or extraction.
- More than two parameters: consider a named input or dependency object.
- File above roughly 150 lines: check whether it contains multiple concepts.

Never extract solely to satisfy a number.

## Common mistakes

- **Tiny helper:** use a named local value or keep the obvious call inline.
- **Inline condition:** name non-straightforward checks and the overall
  decision; use only that name in the `if`.
- **Magic literal:** name its meaning.
- **Throw without a log:** create one message, log it, then throw it.
- **Deep nesting:** reject invalid cases early.
- **Premature abstraction:** tolerate small duplication.
- **Narrating comment:** delete it; name the stage in code instead.

Use [backend-example.md](backend-example.md) as the canonical reference for
file shape and extraction level.

## Common gotchas

- Keep function arguments (inputs) tight and explicit. Destructure only the
  fields the function needs, not the whole wide object.
  - Bad: `function loadAndAuthorize(deps: StreamTurnEventsDependencies, input: StreamTurnEventsInput)`
  - Good: `function loadAndAuthorize({ repositories }: StreamTurnEventsDependencies, { turnId, accountId, userId }: StreamTurnEventsInput)`
- Avoid scattering comments in too many places throughout a PR.
- Keep backend layers separate: services must access the database through model-layer functions, not database models directly.
- Keep `index.ts` files export-only. Do not put logic in them.
- Using comments to overcome a code complexity, instead of making the code explain itself.