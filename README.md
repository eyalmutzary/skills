# Claude skills

Personal [Claude Code](https://docs.anthropic.com/en/docs/claude-code) / agent skills from `~/.claude/skills`.

## Skills

| Skill | What it does |
| --- | --- |
| `explain-diff-html` | Rich interactive HTML explanation of a diff, branch, or PR |
| `how-to-debug-e2e` | Debug client, server, or end-to-end behavior locally (Playwright / mirrored staging) |
| `how-to-explain` | Explain a concept, bug, gap, or system behavior step by step |
| `how-to-explain-plan` | Walk through an implementation plan one step at a time |
| `how-to-fix-pr-comments` | Triage and fix PR review comments against intent and project rules |
| `how-to-help-me-review-pr` | Prepare you to manually review and understand a PR efficiently |
| `how-to-implement-tasks` | Implement an ordered task breakdown as a stack of reviewed, verified PRs |
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
