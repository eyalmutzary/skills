#!/bin/bash
# SessionStart hook for a worker (matcher startup).
# Fetches the base and checks the tools; the harness adds stdout to the context.
FETCH_TIMEOUT_SECONDS=30
MIN_FREE_GB=15
CWD=$(jq -r '.cwd // ""')
cd "$CWD" 2>/dev/null || exit 0

# Fast-forward a clean default-branch checkout, so code read here is fresh.
refresh_main_checkout() {
  local default_branch behind
  default_branch=$(git rev-parse --abbrev-ref origin/HEAD 2>/dev/null) || return
  [ "origin/$(git branch --show-current)" = "$default_branch" ] || return
  behind=$(git rev-list --count "HEAD..$default_branch")
  [ "$behind" -eq 0 ] && return
  local has_local_changes=$(git status --porcelain --untracked-files=no)
  if [ -z "$has_local_changes" ] && git merge --ff-only --quiet "$default_branch" >/dev/null 2>&1; then
    echo "git: fast-forwarded this checkout by $behind commits."
  else
    echo "git: this checkout is $behind commits behind $default_branch. Read code in a worktree made from $default_branch."
  fi
}

echo "== Worker preflight =="

if git rev-parse --git-dir >/dev/null 2>&1; then
  if timeout "$FETCH_TIMEOUT_SECONDS" git fetch --quiet origin 2>/dev/null; then
    echo "git: fetched origin. Branch new work from origin/HEAD."
    refresh_main_checkout
  else
    echo "git: fetch FAILED. Your base may be stale."
  fi
fi

expected_node=$(cat .nvmrc 2>/dev/null)
actual_node=$(node -v 2>/dev/null)
if [ -n "$expected_node" ] && [[ "$actual_node" != v"${expected_node#v}"* ]]; then
  echo "node: $actual_node, but .nvmrc wants $expected_node. Switch before you run tests."
fi

if command -v tsh >/dev/null; then
  tsh_valid=$(tsh status 2>/dev/null | grep -i "valid until")
  if [ -n "$tsh_valid" ]; then
    echo "tsh:${tsh_valid#*:}"
  else
    echo "tsh: not logged in. Mirror and server work needs it: ask master."
  fi
fi

free_gb=$(df -g ~ | awk 'NR==2 {print $4}')
[ "$free_gb" -lt "$MIN_FREE_GB" ] && echo "disk: only ${free_gb}G free. Tell master."
exit 0
