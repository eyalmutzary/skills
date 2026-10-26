#!/bin/bash
# SessionStart hook for the master (matcher compact|resume).
# Prints the state and the learned rules; the harness adds stdout to the context.
cat >/dev/null
for f in "$HOME/.claude/master/state.md" "$HOME/.claude/master-memory.md"; do
  echo "== $f =="
  if [ -f "$f" ]; then cat "$f"; else echo "(missing)"; fi
done
echo "Re-read /how-to-orchestrate, then reconcile the state with claude agents --json."
