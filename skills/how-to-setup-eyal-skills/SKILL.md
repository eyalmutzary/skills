---
name: how-to-setup-eyal-skills
description: Set up Eyal's agentic suite (settings, skills, output styles, CLAUDE.md, status line) in the user's Claude Code.
disable-model-invocation: true
---

# Set up Eyal's skills

Source of truth: https://github.com/eyalmutzary/skills. Always read the files from a fresh clone; never assume their contents.

## 1. Clone and ask

1. `git clone --depth 1 https://github.com/eyalmutzary/skills /tmp/eyal-skills` (remove any old copy first).
2. Ask all questions in one `AskUserQuestion` round:
   - **Status line** — install Eyal's status line (ccstatusline: model, context size, git changes, dir, worktree, branch)? Options: "Yes (Recommended)", "No".
   - **CLAUDE.md** — replace `~/.claude/CLAUDE.md` with Eyal's version, personalized with your name? Options: "Yes (Recommended)", "No".
   - If CLAUDE.md is "Yes", ask for the user's first name. Offer `git config user.name` as the default.

Done when every answer is known.

## 2. Settings

Merge `/tmp/eyal-skills/settings-public.json` into `~/.claude/settings.json` (create it if missing):

- Copy every key as-is (`effortLevel`, `outputStyle`, `autoCompactWindow`, `autoCompactEnabled`, `tui`, and any other key present).
- Copy `statusLine` only if the user said yes.
- Keep every existing key the repo does not set. Write valid JSON.

## 3. Skills and output styles

- Copy each folder in `/tmp/eyal-skills/skills/` to `~/.claude/skills/<name>/`.
- Copy each file in `/tmp/eyal-skills/output-styles/` to `~/.claude/output-styles/`.
- A same-named skill or style is replaced; list the replaced ones in the summary.

## 4. CLAUDE.md (only if yes)

1. Back up the current file to `~/.claude/CLAUDE.md.bak` if it exists.
2. Write `/tmp/eyal-skills/CLAUDE.md` to `~/.claude/CLAUDE.md`, with every `Eyal` replaced by the user's name.
3. If `~/.claude/RTK.md` does not exist, remove the `@RTK.md` line.

## 5. Status line (only if yes)

```bash
npm i -g ccstatusline
mkdir -p ~/.config/ccstatusline
cp /tmp/eyal-skills/statusline/ccstatusline.settings.json ~/.config/ccstatusline/settings.json
cp /tmp/eyal-skills/statusline-command.sh ~/.claude/statusline-command.sh
chmod +x ~/.claude/statusline-command.sh
```

Verify: `command -v ccstatusline` prints a path.

## 6. Matt Pocock's skills

The workflow uses `/grill-with-docs`, `/wayfinder`, `/to-spec`, `/to-tickets` from Matt's suite. If any are missing from the user's Claude setup, install the plugin yourself:

```bash
claude plugin install mattpocock-skills
```

If that command is unavailable or fails, try from inside a Claude Code session context or document the failure in the summary and what you tried.

Done when those four skills are invocable or installation was attempted and reported.

## 7. Summary

Report what changed per step, the replaced skills, backup path, and Matt plugin install result. Mention restarting Claude Code if settings or plugins changed.
