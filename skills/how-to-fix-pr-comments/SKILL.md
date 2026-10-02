---
name: how-to-fix-pr-comments
description: Use when asked for reviewing PR comments
user_invocable: true
---

# How to Fix PR Comments

Treat PR feedback as a collaborative review, not as instructions that are
automatically correct. Validate every comment against the PR's intent, current
code, project rules, and production behavior.

## Workflow

### 1. Gather the current context

Identify the PR, then fetch:

- PR metadata, description, base branch, and current head
- The complete PR diff and relevant surrounding code
- Review comments, review bodies, conversation comments, replies, and thread
status
- Project instructions relevant to the changed files

Work only on new comments that the PR author has not replied to. Do not treat a
resolved thread or a comment already answered by the author as new merely
because another reviewer participated in it.

### 2. Assess every unanswered comment

For each comment, record:

- A concise summary of the request or concern
- An approximate effort score from 1 to 10
- Whether the comment is technically valid
- The proposed disposition: change, decline, clarify, or already addressed
- Whether the user must be involved

Use this effort scale:

- **0:** question, no change is needed
- **1–2:** refactoring, cleanup, naming, readability, or aesthetics
- **3–5:** small increments or missing supporting behavior, such as metrics,
focused tests, or other work that belongs in the PR
- **6–8:** meaningful changes to behavior introduced by the PR, including an
incorrect implementation or semantics
- **9–10:** design-level concerns that challenge the overall solution and may
require major PR changes

The score estimates effort and scope; it does not decide whether the reviewer
is right.

### 3. Research and decide

Investigate each comment before acting. Trace the relevant behavior, inspect
tests and contracts, and compare the suggestion with the PR's goal.

Challenge feedback when it is incorrect, unnecessary, out of scope, or would
make the design worse. In that case, prepare a concise technical explanation
instead of changing the code.

Make the decision independently for cleanup, refactors, aesthetics, tests,
metrics, and small low-risk increments. Involve the user when the decision:

- materially changes user-visible or production behavior
- changes an API, data contract, persistence semantics, rollout, or
compatibility expectation
- chooses between meaningful product or architectural tradeoffs
- substantially changes the PR's intended design
- is uncertain enough that product or domain intent is required

Scores 9–10 always require the user. Scores 6–8 usually require the user unless
the change clearly restores already-agreed behavior and has no meaningful
tradeoff.

### 4. Complete independent work first

Implement all changes that do not require the user. For refactoring, cleanup,
or aesthetics, invoke `/how-to-write-code` and follow it.

Keep changes scoped to the comments. Add focused verification proportional to
the risk, and do not add tests merely to preserve behavior that was removed.

Do not reply on GitHub yet. First finish and verify the independent changes.

Then tell the user only about independent changes that affect behavior. For
each one, briefly explain:

- the review concern
- what changed
- the resulting behavior and why the decision was safe to make independently

Do not burden the user with routine cleanup details.

### 5. Resolve user decisions one at a time

Present one user-dependent comment at a time. Include:

- the reviewer's comment and relevant code context
- what behavior or design decision is actually at stake
- viable options and their tradeoffs
- a clear recommendation with reasoning

Let the user ask questions. Do not move to the next comment until the user says
`continue`.

If more than one comment needs the user, create a temporary decision document
before discussing the first one. Keep it concise and update it after every
decision:

```markdown
# PR Comment Decisions

## Comment <link or ID>
- Concern:
- Decision:
- Reason:
- Required action:
```

Store the document in a temporary location outside the repository. Do not
implement user-dependent changes or post replies until all such comments have
decisions.

### 6. Implement the agreed decisions

After the user has reviewed all user-dependent comments:

1. Implement every agreed change.
2. Verify the complete change set.
3. Re-read each unanswered comment and confirm its disposition matches the
  code and the recorded decisions.

If implementation reveals a new material tradeoff, stop and return that
specific decision to the user rather than guessing.

### 7. Reply to every comment

Reply to each previously unanswered GitHub comment with a clear, concise
outcome:

- **Changed:** state what changed and the resulting behavior.
- **Declined:** explain the concrete technical reason.
- **Clarified:** answer the question directly.
- **Already addressed:** point to the relevant code or existing behavior.

Do not write vague replies such as “done” or “fixed.” Do not claim that local
changes are visible in the PR; if they have not been pushed, say they will be
included in the next push.

Preserve one reply per comment so no feedback is silently dropped. Use the
correct GitHub thread or conversation reply mechanism for each comment type.

### 8. Finish

Delete the temporary decision document, if one was created.

Summarize:

- changes made
- comments declined or clarified
- verification performed
- any remaining risks or follow-ups

Do not commit or push automatically. Ask the user whether they want the changes
committed and pushed.

## Guardrails

- Validate every review comment before accepting it.
- Reply to every comment, including comments that are declined.
- Present user decisions individually in focused approval requests.
- Wait for the user to say `continue` before moving past a user-dependent
comment.
- Post GitHub replies after the code and decisions they describe are complete.

