---
name: custom-review
description: Use when reviewing a PR — diffs against master, checks GitHub reviewer comments, validates against CLAUDE.md guidelines, and produces severity-ranked issues with suggested fixes.
user_invocable: true
---

# Custom Review

An enhanced code review skill that goes beyond a basic diff review. It pulls the full PR context from GitHub, incorporates other reviewers' comments, validates against project guidelines (CLAUDE.md), and produces a severity-ranked summary with actionable fix suggestions.

## What To Do When This Skill Is Triggered

### Input

The user may provide a PR number as an argument. If not, detect it automatically or list open PRs.

### Step 1: Identify the PR

1. If a PR number is provided, use it directly.
2. If no PR number is provided, check if the current branch has an associated PR:
   ```bash
   gh pr view --json number,title,url 2>/dev/null
   ```
3. If no PR is found for the current branch, run `gh pr list --limit 15` and ask the user to pick one.

### Step 2: Gather PR Context

Run the following commands to collect all context:

1. **PR metadata**:
   ```bash
   gh pr view <number> --json title,body,author,baseRefName,headRefName,labels,reviewDecision,state,url,additions,deletions,changedFiles
   ```

2. **Full diff against master**:
   ```bash
   gh pr diff <number>
   ```

3. **Reviewer comments and review threads**:
   ```bash
   gh api repos/{owner}/{repo}/pulls/<number>/reviews
   gh api repos/{owner}/{repo}/pulls/<number>/comments
   ```

4. **PR review status** (who approved, who requested changes):
   ```bash
   gh pr view <number> --json reviews --jq '.reviews[] | {author: .author.login, state: .state, body: .body}'
   ```

### Step 3: Load Project Guidelines

Dynamically discover and read the coding standards for the **current repository** — do not assume any specific repo structure.

1. **Find all CLAUDE.md files** in the repo:
   ```bash
   find . -name "CLAUDE.md" -not -path "*/node_modules/*" -not -path "*/.git/*"
   ```
2. **Read the root CLAUDE.md** first — this is the primary source of project-wide conventions, architecture, coding rules, testing guidelines, and more.
3. **Read subdirectory CLAUDE.md files** that are relevant to the changed files. Match by path prefix — e.g., if the PR touches files in `packages/my-pkg/`, read `packages/my-pkg/CLAUDE.md` if it exists.
4. **Extract the key rules** from whatever you find. These vary per repo but typically include:
   - Architecture patterns and conventions
   - Coding rules and restrictions
   - Testing guidelines and standards
   - Logging and observability conventions
   - Security requirements
   - Diff hygiene expectations
5. If **no CLAUDE.md files exist** in the repo, skip guideline-specific checks and note this in the review output. Still perform general best-practice checks (correctness, security, code quality).

### Step 4: Analyze Reviewer Comments & Author Responses

Summarize the existing review feedback, including the PR author's responses:

1. Group comments by reviewer.
2. For each reviewer, list:
   - Their review decision (approved / changes requested / commented)
   - Key concerns or suggestions they raised
3. For each reviewer comment, check if the PR author replied (comments with `in_reply_to_id` form threads). For each comment, show:
   - The reviewer's concern
   - The PR author's response (quote or summarize)
   - The disposition: **Fixed** (code was changed), **Declined** (author gave a justification for not changing), or **Unresolved** (no response or not addressed)
4. Highlight any unresolved threads that still need attention.

If there are no reviewer comments yet, note that and proceed.

### Step 5: Perform Your Own Review

Analyze the diff thoroughly, checking each changed file against the project guidelines. For each issue found, classify it by severity.

**Review checklist:**

#### Correctness
- Logic errors, off-by-one, null/undefined handling
- Missing error handling for external IO / LLM calls
- Race conditions or async issues
- Type safety issues

#### Project Conventions (from CLAUDE.md)
- Validate against every rule extracted in Step 3
- Check that the changed code follows the architecture patterns, coding rules, testing standards, logging conventions, and any other guidelines documented in the repo's CLAUDE.md files
- If no CLAUDE.md was found, apply general best practices only

#### Code Quality
- Code clarity and readability
- DRY violations or premature abstractions
- Dead code or unused imports
- Naming consistency

#### Security
- OWASP top 10 vulnerabilities
- Input validation at system boundaries
- Sensitive data exposure (secrets, tokens in logs)
- SQL injection via raw queries

#### Testing
- Are new/changed functions covered by tests?
- Do tests follow the single-assertion rule?
- Do tests verify contracts, not implementation?
- Are mocks set up correctly?

#### Performance
- N+1 query patterns
- Missing database indexes for new queries
- Unnecessary async operations
- Large payload handling

#### Feature Flag Protection
- Does the PR introduce a **new feature** (new endpoint, new user-facing behavior, new workflow path, new UI capability)?
- If yes, is the new feature gated behind a **feature flag** (e.g., Ignite feature flag, environment variable toggle, or similar runtime switch)?
- New features that affect production behavior **must** be protected by a feature flag so they can be safely rolled out and rolled back without a deploy.
- Exceptions (do NOT flag these): pure refactors with no behavior change, bug fixes restoring previous behavior, internal tooling/scripts, test-only changes, documentation, and additive changes that are strictly backwards-compatible with no user-facing impact (e.g., adding an optional field to a response).
- If a new feature lacks feature flag protection, report it as a 🟠 Major issue.

#### Diff Hygiene
- Unrelated file changes (lockfile, config, formatting)
- Accidental debug code left in (console.log, debugger)

### Step 6: Produce the Review Summary

Format the output as follows:

---

## PR Review: `<PR title>`
**PR:** `<PR URL>`
**Author:** `<author>`
**Branch:** `<head>` → `<base>`
**Changes:** `+<additions>` / `-<deletions>` across `<changedFiles>` files

### Overview
<2-4 sentences describing what this PR does and why>

### Review History & Author Responses
<Summary of existing reviews — if none, state "No reviews yet">

| Reviewer | Decision | Key Concerns |
|----------|----------|-------------|
| @name    | Approved / Changes Requested | Brief summary |

For each reviewer comment with substance, show the thread:

**N. <severity> <issue title>** — `File:Line`
> Reviewer's concern (summarized)

**Author response:** "quoted or summarized reply"
**Status:** ✅ Fixed in commit `<sha>` / ✅ Declined — <justification summary> / ❌ Unresolved

**Unresolved threads:** <count or "None">

### Issues Found

#### 🔴 Critical (must fix before merge)
- **[File:Line]** Description of the issue
  - **Why:** Explanation of the risk
  - **Suggested fix:**
    ```typescript
    // suggested code
    ```

#### 🟠 Major (should fix)
- **[File:Line]** Description of the issue
  - **Why:** Explanation
  - **Suggested fix:** Description or code

#### 🟡 Minor (nice to have)
- **[File:Line]** Description of the issue
  - **Suggested fix:** Description or code

#### 💡 Suggestions (optional improvements)
- **[File:Line]** Suggestion description

### Guideline Violations
<List any CLAUDE.md guideline violations found, referencing the specific rule>

### Feature Flag Coverage
<List any new features introduced without feature flag protection. For each, state what the new feature is, why it needs a flag, and suggest where to add one. If all new features are properly gated — or the PR doesn't introduce new features — state "N/A".>

### Test Coverage Assessment
<Are the changes adequately tested? What's missing?>

### Summary
| Severity | Count |
|----------|-------|
| 🔴 Critical | X |
| 🟠 Major | X |
| 🟡 Minor | X |
| 💡 Suggestions | X |

**Verdict:** <Ready to merge / Needs minor fixes / Needs major revision / Requires re-review>

---

### Code Review

- When posting GitHub PR reviews, write the review body JSON to a temp file and use `gh api --input` to avoid shell escaping/encoding issues.

### Important Notes

- Always fetch the latest diff from GitHub — do not rely on local state alone.
- When reading large diffs, process file by file to avoid missing issues.
- Be specific: always reference the file and line number for every issue.
- Suggested fixes should be concrete and copy-pasteable when possible.
- Do not nitpick formatting if the project uses Prettier/ESLint — those are auto-enforced.
- If a reviewer comment has already been addressed in a subsequent commit, mark it as resolved.
- Be honest about severity — don't inflate minor issues to critical. Reserve 🔴 Critical for bugs, security issues, and data loss risks.
- If the PR looks good and follows all guidelines, say so clearly. Not every PR has issues.
