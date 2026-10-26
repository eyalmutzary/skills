---
name: how-to-setup-eyal-skills
description: Set up Eyal's agentic suite (settings, skills, output styles, CLAUDE.md, status line, RTK, inbox, hooks, worktree sweep) in the user's Claude Code.
disable-model-invocation: true
---

# Set up Eyal's skills

Source of truth: https://github.com/eyalmutzary/skills. Always read the files from a fresh clone; never assume their contents.

## 1. Clone and ask

1. `git clone --depth 1 https://github.com/eyalmutzary/skills /tmp/eyal-skills` (remove any old copy first).
2. Ask all questions in one `AskUserQuestion` round:
   - **Local skill copy** — copy skills and output styles into `~/.claude`? Options: "No (Recommended if `eyal-skills` plugin is installed)", "Yes (editable local copy)".
   - **Status line** — install Eyal's status line (ccstatusline)? Options: "Yes (Recommended)", "No".
   - **RTK** — install [RTK](https://github.com/rtk-ai/rtk) so shell output is filtered before it reaches the model? Options: "Yes (Recommended)", "No".
   - **CLAUDE.md** — replace `~/.claude/CLAUDE.md` with Eyal's version, personalized with your name? Options: "Yes (Recommended)", "No".
3. In a second round:
   - If CLAUDE.md is "Yes", ask for the user's first name. Offer `git config user.name` as the default.
   - **Extras** (multi-select, all recommended):
     - "Inbox" — a pane where the master puts decisions and reports.
     - "Dev permissions" — pre-allow common dev commands (git, gh, npm, tests, ls, grep, …) and ask before `sudo`.
     - "Keep Mac awake" (macOS only) — a hook that stops sleep while a Claude session runs.
     - "Worktree sweep" (macOS only) — a job, twice a week, that removes worktrees in `<repo>/.claude/worktrees/` idle for 3 days with nothing unsaved.

Done when every answer is known.

## 2. Settings

Back up `~/.claude/settings.json` to `~/.claude/settings.json.bak` if it exists. Merge `/tmp/eyal-skills/settings-public.json` into it (create it if missing):

- Copy every key as-is, except the ones below.
- `statusLine`: only if the user said yes.
- `permissions`: only if "Dev permissions" was picked. Add each rule to the user's `allow`, `ask`, and `deny` lists; drop duplicates.
- `env`: add each variable. Skip `CLAUDE_CODE_PLUGIN_DIRS` unless "Inbox" was picked; if the user already has it, append `,~/.claude/mods/inbox`.
- Keep every existing key the repo does not set. Write valid JSON.

## 3. Skills and output styles (only if local copy = Yes)

- Copy each folder in `/tmp/eyal-skills/skills/` to `~/.claude/skills/<name>/`.
- Copy each file in `/tmp/eyal-skills/output-styles/` to `~/.claude/output-styles/`.
- List replaced names in the summary. If skipped, say skills come from the installed plugin (`/eyal-skills:…` or `/e-skills:…`).

## 4. RTK (only if yes)

The hook and `RTK.md` come from the installed `rtk` binary. Do not copy `rtk-rewrite.sh`.

1. If `command -v rtk` fails, or `rtk gain` fails because a different project named rtk is installed:
   - macOS: `brew install rtk`
   - otherwise: `curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh`
2. `rtk init -g --auto-patch`
3. `rtk init -g --show` should report the hook, `~/.claude/RTK.md`, and `settings.json` as ok.
4. Master workers must run plain `git`. Wrap the RTK hook:
   ```bash
   mkdir -p ~/.claude/hooks
   cp /tmp/eyal-skills/hooks/rtk-skip-git-in-workers.sh ~/.claude/hooks/
   chmod +x ~/.claude/hooks/rtk-skip-git-in-workers.sh
   ```
   In `~/.claude/settings.json`, change the `PreToolUse` command that runs `rtk-rewrite.sh` to `$HOME/.claude/hooks/rtk-skip-git-in-workers.sh` (absolute path).

## 5. CLAUDE.md (only if yes)

1. Back up the current file to `~/.claude/CLAUDE.md.bak` if it exists.
2. Write `/tmp/eyal-skills/CLAUDE.md` to `~/.claude/CLAUDE.md`, with every `Eyal` replaced by the user's name.
3. If the user declined RTK and `~/.claude/RTK.md` does not exist, remove the `@RTK.md` line.
4. If the user did not pick "Worktree sweep", remove the sentence about the job that deletes worktrees.

## 6. Status line (only if yes)

```bash
npm i -g ccstatusline
mkdir -p ~/.config/ccstatusline
cp /tmp/eyal-skills/statusline/ccstatusline.settings.json ~/.config/ccstatusline/settings.json
cp /tmp/eyal-skills/statusline-command.sh ~/.claude/statusline-command.sh
chmod +x ~/.claude/statusline-command.sh
```

Verify: `command -v ccstatusline` prints a path.

## 7. Extras (only the picked ones)

**Inbox:**

```bash
mkdir -p ~/.claude/mods
rm -rf ~/.claude/mods/inbox
cp -R /tmp/eyal-skills/mods/inbox ~/.claude/mods/inbox
```

**Keep Mac awake:** copy `/tmp/eyal-skills/hooks/caffeinate.sh` to `~/.claude/hooks/`, `chmod +x` it, and add a `SessionStart` hook in `~/.claude/settings.json` with the command `$HOME/.claude/hooks/caffeinate.sh` (absolute path). Keep the existing hooks.

**Worktree sweep:**

```bash
mkdir -p ~/.claude/scripts ~/.claude/logs
cp /tmp/eyal-skills/scripts/worktree-sweep.sh ~/.claude/scripts/
chmod +x ~/.claude/scripts/worktree-sweep.sh
sed "s#__HOME__#$HOME#g" /tmp/eyal-skills/scripts/worktree-sweep.plist.template > ~/Library/LaunchAgents/com.claude.worktree-sweep.plist
launchctl bootout gui/$(id -u)/com.claude.worktree-sweep 2>/dev/null
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.claude.worktree-sweep.plist
```

The script sweeps repos in `~/Development/*` and `~/.claude`. If the user keeps repos elsewhere, ask for the folder and change `REPO_PARENTS` in the copied script. Then run `~/.claude/scripts/worktree-sweep.sh --dry-run` and show the user what it would remove.

## 8. Matt's planning skills

If `/grill-with-docs` or `/wayfinder` is missing, run `claude plugin install mattpocock-skills`.

## 9. Master kit (always)

```bash
mkdir -p ~/.claude/master
cp -R /tmp/eyal-skills/skills/how-to-orchestrate/hooks /tmp/eyal-skills/skills/how-to-orchestrate/master-settings.json ~/.claude/master/
chmod +x ~/.claude/master/hooks/*.sh
```

The master loads its hook through `master-settings.json`, so install no global hook. Workers watch PRs with `how-to-babysit-pr/scripts/pr-watch`, and the master watches workers with `how-to-orchestrate/scripts/master-watch`; both need `gh` logged in and `python3`.

## 10. Summary

What changed, backup paths, plugin install outcome. Print the "Start the master" command from `/tmp/eyal-skills/skills/how-to-orchestrate/commands.md`. Restart Claude Code if settings, hooks, mods, or plugins changed.
