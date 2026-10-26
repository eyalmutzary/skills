#!/bin/bash
# PreToolUse hook for Bash in the master.
# Allows, but logs, the commands a worker should run; each line points to an instruction to tighten.
LOG="$HOME/.claude/master/self-actions.log"
WORKER_ACTION_PATTERN='(^|[;&|(`[:space:]])(gh[[:space:]]+(pr[[:space:]]+(merge|create|ready|comment|review|edit|close)|stack[[:space:]]+(merge|submit)|api[[:space:]].*(-X|--method)[[:space:]]*(POST|PATCH|PUT|DELETE))|git[[:space:]]+push|kill|pkill)([[:space:]]|$)'
CMD=$(jq -r '.tool_input.command // ""')
if [[ "$CMD" =~ $WORKER_ACTION_PATTERN ]]; then
  printf '%s\t%s\n' "$(date '+%Y-%m-%d %H:%M')" "$(tr '\n' ' ' <<<"$CMD")" >> "$LOG"
fi
exit 0
