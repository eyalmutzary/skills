#!/usr/bin/env bash
# Master workers set RTK_NO_GIT: the worktree-isolation guard refuses `rtk git`.
# rtk-rewrite.sh is hash-checked by rtk, so the skip lives here, not there.

RTK_HOOK="$HOME/.claude/hooks/rtk-rewrite.sh"
COMMAND_USES_GIT_PATTERN='(^|[;&|(`[:space:]])git([[:space:]]|$)'

INPUT=$(cat)
CMD=$(jq -r '.tool_input.command // empty' <<<"$INPUT")

if [ -n "$RTK_NO_GIT" ] && [[ "$CMD" =~ $COMMAND_USES_GIT_PATTERN ]]; then
  exit 0
fi

printf '%s' "$INPUT" | exec "$RTK_HOOK"
