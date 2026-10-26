#!/bin/bash
# Keep the Mac awake while this Claude process lives (subagents run inside it).
# caffeinate exits by itself when the Claude process exits.
pgrep -f "caffeinate -i -w $PPID" >/dev/null && exit 0
nohup caffeinate -i -w "$PPID" >/dev/null 2>&1 &
