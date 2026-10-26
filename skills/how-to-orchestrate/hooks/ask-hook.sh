#!/bin/bash
# PreToolUse hook for AskUserQuestion in a worker.
# usage: ask-hook.sh <attached-flag-file> <master-name>
# Lets the call through only while the user is attached (flag file exists).
cat >/dev/null
FLAG="$1"
MASTER="${2:-master}"
if [ -f "$FLAG" ]; then exit 0; fi
cat <<JSON
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"AskUserQuestion is blocked. Send your question to $MASTER with SendMessage as Q<n>: ..., then end your turn and wait for A<n>."}}
JSON
