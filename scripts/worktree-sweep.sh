#!/bin/bash
# Removes worktrees under <repo>/.claude/worktrees/ that have no git activity for
# MAX_IDLE_DAYS. Keeps any worktree whose work could be lost.
# Usage: worktree-sweep.sh [--dry-run]

set -uo pipefail

readonly MAX_IDLE_DAYS=3
readonly SECONDS_PER_DAY=86400
readonly WORKTREES_SUBDIR=".claude/worktrees"
readonly LOG_FILE="$HOME/.claude/logs/worktree-sweep.log"
readonly REPO_PARENTS=("$HOME/Development"/*/ "$HOME/.claude/")

main() {
  local is_dry_run=false
  [ "${1:-}" = "--dry-run" ] && is_dry_run=true

  mkdir -p "$(dirname "$LOG_FILE")"
  log "start" "dry_run=$is_dry_run"

  local repo
  while IFS= read -r repo; do
    sweep_repo "$repo" "$is_dry_run"
  done < <(list_main_checkouts)

  log "done" "free_disk=$(df -h "$HOME" | awk 'NR==2 {print $4}')"
}

list_main_checkouts() {
  local dir
  for dir in "${REPO_PARENTS[@]}"; do
    [ -d "$dir/.git" ] && echo "${dir%/}"
  done
}

sweep_repo() {
  local repo=$1 is_dry_run=$2

  if [ "$is_dry_run" = true ]; then
    git -C "$repo" worktree prune --dry-run --verbose
  else
    git -C "$repo" worktree prune
  fi

  local worktree
  while IFS= read -r worktree; do
    sweep_worktree "$repo" "$worktree" "$is_dry_run"
  done < <(list_managed_worktrees "$repo")
}

list_managed_worktrees() {
  local repo=$1
  git -C "$repo" worktree list --porcelain |
    awk '/^worktree / {print substr($0, 10)}' |
    grep -F "$repo/$WORKTREES_SUBDIR/"
}

sweep_worktree() {
  local repo=$1 worktree=$2 is_dry_run=$3

  local idle_days
  idle_days=$(days_since_last_activity "$worktree")
  local keep_reason
  keep_reason=$(reason_to_keep "$worktree" "$idle_days")

  if [ -n "$keep_reason" ]; then
    log "kept" "$worktree ($keep_reason)"
    return
  fi

  if [ "$is_dry_run" = true ]; then
    log "would-remove" "$worktree (idle ${idle_days}d)"
    return
  fi

  remove_worktree "$repo" "$worktree" "$idle_days"
}

reason_to_keep() {
  local worktree=$1 idle_days=$2

  if [ "$idle_days" -lt "$MAX_IDLE_DAYS" ]; then
    echo "active, idle ${idle_days}d"
  elif is_used_by_a_process "$worktree"; then
    echo "a running process has its cwd inside"
  elif [ -n "$(git --no-optional-locks -C "$worktree" status --porcelain)" ]; then
    echo "uncommitted changes"
  elif ! is_work_saved "$worktree"; then
    echo "unpushed commits"
  fi
}

is_used_by_a_process() {
  local worktree=$1
  lsof -a -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' |
    awk -v dir="$worktree" '$0 == dir || index($0, dir "/") == 1 { found = 1 } END { exit !found }'
}

days_since_last_activity() {
  local worktree=$1
  local git_dir
  git_dir=$(git -C "$worktree" rev-parse --absolute-git-dir)

  local newest_mtime
  newest_mtime=$(stat -f %m "$git_dir/index" "$git_dir/HEAD" 2>/dev/null |
    sort -n | tail -1)

  echo $(( ($(date +%s) - newest_mtime) / SECONDS_PER_DAY ))
}

# Work is saved when every commit is on a remote, or its PR is closed. The second case
# covers merged PRs whose remote branch was deleted.
is_work_saved() {
  local worktree=$1

  local unpushed_commit
  unpushed_commit=$(git -C "$worktree" log -1 --format=%h HEAD --not --remotes)
  [ -z "$unpushed_commit" ] && return 0

  local branch
  branch=$(git -C "$worktree" symbolic-ref --short -q HEAD) || return 1

  local pr_state
  pr_state=$(cd "$worktree" && gh pr view "$branch" --json state --jq .state 2>/dev/null)
  [ "$pr_state" = "MERGED" ] || [ "$pr_state" = "CLOSED" ]
}

remove_worktree() {
  local repo=$1 worktree=$2 idle_days=$3

  local branch
  branch=$(git -C "$worktree" symbolic-ref --short -q HEAD)

  if ! git -C "$repo" worktree remove "$worktree"; then
    log "failed" "$worktree (git worktree remove)"
    return
  fi
  [ -n "$branch" ] && git -C "$repo" branch -D --quiet "$branch"

  log "removed" "$worktree (idle ${idle_days}d, branch ${branch:-detached})"
}

log() {
  local status=$1 detail=$2
  echo "$(date '+%F %T') $status $detail" | tee -a "$LOG_FILE"
}

main "$@"
