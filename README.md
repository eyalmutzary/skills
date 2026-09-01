# Claude skills

Personal [Claude Code](https://docs.anthropic.com/en/docs/claude-code) / agent skills from `~/.claude/skills`.

This repo tracks a whitelist of the Claude home directory — currently `skills/`, `CLAUDE.md`, `output-styles/`, `settings-public.json`, and the status line. Other paths can be added later by un-ignoring them in `.gitignore`.

## Skills

| Skill | What it does |
| --- | --- |
| `compress-logs` | Reformat noisy structured logs into a lean, readable form (manual only) |
| `excalidraw-diagram` | Generate Excalidraw diagrams (teaching or sketch mode) |
| `explain-diff-html` | Rich interactive HTML explanation of a diff, branch, or PR |
| `how-to-explain` | Explain a concept, bug, gap, or system behavior step by step |
| `how-to-explain-plan` | Walk through an implementation plan one step at a time |
| `how-to-fix-pr-comments` | Triage and fix PR review comments against intent and project rules |
| `how-to-write-code` | Coding conventions (shape, naming, frontend guidance) |

## Output styles

| Style | What it does |
| --- | --- |
| `ELI5` | Plain, short answers (ASD-STE100-ish); what happened, did it work, what next |

## Status line

Claude Code runs `statusline-command.sh`, which launches [ccstatusline](https://www.npmjs.com/package/ccstatusline). Layout is in `statusline/ccstatusline.settings.json` (live copy on a machine: `~/.config/ccstatusline/settings.json`).

```bash
npm i -g ccstatusline
mkdir -p ~/.config/ccstatusline
cp statusline/ccstatusline.settings.json ~/.config/ccstatusline/settings.json
```

Point `statusLine.command` at `~/.claude/statusline-command.sh` (see `settings-public.json`). The script uses `ccstatusline` from `PATH`, then a local nvm install.

## Layout

```
skills/<skill-name>/SKILL.md          # required entry point
skills/<skill-name>/...               # optional references and helpers
output-styles/<Name>.md               # Claude Code output styles
settings-public.json                  # settings safe to share publicly
statusline-command.sh                 # launches ccstatusline
statusline/ccstatusline.settings.json # ccstatusline layout
```

## Whitelist

Root `.gitignore` ignores everything, then allows specific paths:

```gitignore
/*
!.gitignore
!README.md
!CLAUDE.md
!skills/
!output-styles/
!settings-public.json
!statusline-command.sh
!statusline/
```

To track another folder (e.g. `commands/`), add `!commands/`.
