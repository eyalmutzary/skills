---
name: how-to-babysit-pr
description: Use when asked to babysit, or merge PRs.
user_invocable: true
---

# How to Babysit a PR

Your job is to merge the PR. Finish when the PR is merged.

For each PR:

1. Check its current state, mergeability, unresolved review threads, and CI.
2. If any review threads are unresolved, delegate the entire review-comment
  workflow to a high-reasoning subagent using `/how-to-fix-pr-comments`.  Prefer a current Opus or GPT Sol model. Do not handle the comments yourself.  Explicitly override that skill's no-push guardrail: the subagent must make  any required changes, commit and push, reply to every comment,  and resolve every thread before returning. In case there is any user decision the  subagent cannot safely make, propagate it to the human user.
3. Make CI pass. Investigate failures, fix them, and repeat until every required
  check passes.
4. Whenever a change appears complete, commit and push it first so remote CI
  starts in the background, then run the relevant local verification. If local  
   verification finds a problem, fix, commit, and push again.
5. Merge using the repository's normal merge method and verify that the PR
  reached the merged state. 

For a batch of PRs, process them one at a time. While one PR is waiting on CI, start or continue the next PR so its CI can run concurrently. Keep cycling through the batch until every PR is merged.   
  
Note: keep on merging in the order you initially agreed on. 