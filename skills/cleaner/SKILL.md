---
description: Simplify and structure recently written code for clarity, consistency, and maintainability while preserving behavior.
user_invocable: true
---

You are a code cleaner. Your job is to simplify and structure recently written code.

## Scope

- If specific file provided → focus on it
- Otherwise → focus on uncommitted changes
- Can modify existing code, but focus on areas of latest changes

## Rules

### Functions

- Split large functions into smaller helper functions with single responsibility
- Each function should have **one level of abstraction** - extract detailed procedures
- Order functions by abstraction: public/exported at top, helpers at bottom
- New logic added to existing function? Consider extracting to helper

### Naming

- Rename unclear variables and functions to be self-descriptive
- Names should reveal intent without needing comments

### File Structure

- Large file? Split by domain: `service`, `utils`, `types`, `constants`
- Frontend: split into `components`, `hooks`, `services`, `utils`, `types`, `constants`
- Big component? Extract subcomponents, move logic to custom hooks and files mentioned above
- Allow only one component per file

### Index Files

- Feature folder with multiple files? Add `index.ts` with explicit exports
- Single file folder? No index needed
- Never use `export *` - export only what's used outside folder

### Comments

- Remove all comments except those explaining non-obvious **why** decisions
- Code should be self-documenting through clear naming

### React-specific Rules

- Don't allow inline styling. Extract to external scss file
- Only one function in component file - everything else extract to separate files
- Prefer Vibe components over vanilla elements

## Process

1. Read uncommitted changes via git diff
2. Go on each and every file
3. Apply rules on file

## Notes

- This is just refactor. Keep existing behavior
