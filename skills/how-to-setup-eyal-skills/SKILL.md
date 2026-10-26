---
name: how-to-setup-eyal-skills
description: Set up Eyal's agentic suite (settings, skills, output styles, CLAUDE.md, status line, RTK) in the user's Claude Code.
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
   - If CLAUDE.md is "Yes", ask for the user's first name. Offer `git config user.name` as the default.

Done when every answer is known.

## 2. Settings

Merge `/tmp/eyal-skills/settings-public.json` into `~/.claude/settings.json` (create it if missing):

- Copy every key as-is (`effortLevel`, `outputStyle`, `autoCompactWindow`, `autoCompactEnabled`, `tui`, and any other key present).
- Copy `statusLine` only if the user said yes.
- Keep every existing key the repo does not set. Write valid JSON.

## 3. Skills and output styles (only if local copy = Yes)

- Copy each folder in `/tmp/eyal-skills/skills/` to `~/.claude/skills/<name>/`.
- Copy each file in `/tmp/eyal-skills/output-styles/` to `~/.claude/output-styles/`.
- List replaced names in the summary. If skipped, say skills come from `/eyal-skills:…` via the plugin.

## 4. RTK (only if yes)

The hook and `RTK.md` come from the installed `rtk` binary. Do not copy a hook script.

1. If `command -v rtk` fails, or `rtk gain` fails because a different project named rtk is installed:
   - macOS: `brew install rtk`
   - otherwise: `curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh`
2. `rtk init -g --auto-patch`
3. `rtk init -g --show` should report the hook, `~/.claude/RTK.md`, and `settings.json` as ok.

## 5. CLAUDE.md (only if yes)

1. Back up the current file to `~/.claude/CLAUDE.md.bak` if it exists.
2. Write `/tmp/eyal-skills/CLAUDE.md` to `~/.claude/CLAUDE.md`, with every `Eyal` replaced by the user's name.
3. If the user declined RTK and `~/.claude/RTK.md` does not exist, remove the `@RTK.md` line.

## 6. Status line (only if yes)

```bash
npm i -g ccstatusline
mkdir -p ~/.config/ccstatusline
cp /tmp/eyal-skills/statusline/ccstatusline.settings.json ~/.config/ccstatusline/settings.json
cp /tmp/eyal-skills/statusline-command.sh ~/.claude/statusline-command.sh
chmod +x ~/.claude/statusline-command.sh
```

Verify: `command -v ccstatusline` prints a path.

## 7. Matt's planning skills

If `/grill-with-docs` or `/wayfinder` is missing, run `claude plugin install mattpocock-skills`.

## 8. Master kit (always)

```bash
mkdir -p ~/.claude/master
cp -R /tmp/eyal-skills/skills/how-to-orchestrate/hooks /tmp/eyal-skills/skills/how-to-orchestrate/master-settings.json ~/.claude/master/
```

The master loads its hook through `master-settings.json`, so install no global hook.

## 9. Summary

What changed, backup path, plugin install outcome. Print the "Start the master" command from `/tmp/eyal-skills/skills/how-to-orchestrate/commands.md`. Restart Claude Code if settings or plugins changed.
