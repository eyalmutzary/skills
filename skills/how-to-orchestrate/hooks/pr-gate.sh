#!/bin/bash
# PreToolUse hook for Bash in a worker. Usage: pr-gate.sh <worker name>
# Denies the ship commands until every review thread of the worker has a reviewer round and a QA line.
NAME="$1"
INPUT=$(cat)
CMD=$(jq -r '.tool_input.command // ""' <<<"$INPUT")
CWD=$(jq -r '.cwd // ""' <<<"$INPUT")
SHIP_PATTERN='(^|[;&|(`[:space:]])gh[[:space:]]+(pr[[:space:]]+(create|ready)|stack[[:space:]]+submit)([[:space:]]|$)'
DOCS_PATH_PATTERN='(^|/)docs/'
HOW_TO_FIX='Finish /how-to-implement gates 3 and 4, then add `QA: <report path>` to the review thread. Only the user can waive QA: ask master as Q<n>, then add `QA waived by user: <their words>`.'

deny() {
  jq -n --arg reason "Blocked: $1 $HOW_TO_FIX" \
    '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$reason}}'
  exit 0
}

is_docs_only_change() {
  local changed
  changed=$(git -C "$CWD" diff --name-only origin/HEAD...HEAD 2>/dev/null)
  [ -n "$changed" ] && ! grep -Evq "$DOCS_PATH_PATTERN" <<<"$changed"
}

has_qa_line() {
  local report
  grep -Eq '^QA waived by user: .+' "$1" && return 0
  report=$(grep -Eo '^QA: /[^[:space:]]+' "$1" | tail -1 | cut -c5-)
  [ -n "$report" ] && [ -f "$report" ]
}

[[ "$CMD" =~ $SHIP_PATTERN ]] || exit 0
is_docs_only_change && exit 0

shopt -s nullglob
threads=(/tmp/*"$NAME"*-review.md)
[ ${#threads[@]} -eq 0 ] && deny "no /tmp/*$NAME*-review.md found."

for thread in "${threads[@]}"; do
  grep -Eq '^## R[0-9]+ \(reviewer\)' "$thread" || deny "$thread has no reviewer round."
  has_qa_line "$thread" || deny "$thread has no QA line, or its report file is missing."
done
exit 0
