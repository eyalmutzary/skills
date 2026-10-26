#!/bin/bash
# PreToolUse hook for Bash in a worker.
# Denies rm -rf of the home or parent folder, and a worktree not made from origin.
# Deny rules do not bind under bypass mode.
CMD=$(jq -r '.tool_input.command // ""')
SEGMENTS=$(printf '%s\n' "$CMD" | tr ';&|' '\n\n\n')
RMRF='(^|[[:space:]])rm[[:space:]].*(-[a-zA-Z]*[rR]|--recursive).*[[:space:]]"?(~|\$\{?HOME\}?|\.\.)([/"[:space:]]|$)'
WORKTREE_ADD='(^|[[:space:]])git[[:space:]].*worktree[[:space:]]+add([[:space:]]|$)'
ORIGIN_BASE='[[:space:]]"?origin/'

deny() {
  jq -cn --arg reason "$1" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$reason}}'
  exit 0
}

if printf '%s\n' "$SEGMENTS" | grep -Eq "$RMRF"; then
  deny "Blocked: rm -rf outside the worktree. This is destructive; ask master as Q<n> and wait."
fi

if printf '%s\n' "$SEGMENTS" | grep -E "$WORKTREE_ADD" | grep -Evq "$ORIGIN_BASE"; then
  deny "Blocked: make every worktree from origin, so it has the latest code. Run git fetch, then: git worktree add .claude/worktrees/<slug> -b <branch> origin/HEAD. For an existing branch: git worktree add .claude/worktrees/<slug> -B <branch> origin/<branch>."
fi
exit 0
