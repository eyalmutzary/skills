# Claude skills

Personal [Claude Code](https://docs.anthropic.com/en/docs/claude-code) / agent skills from `~/.claude/skills`.

This repo tracks a whitelist of the Claude home directory — currently `skills/`, `CLAUDE.md`, `output-styles/`, and `settings-public.json`. Other paths can be added later by un-ignoring them in `.gitignore`.

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

## Layout

```
skills/<skill-name>/SKILL.md          # required entry point
skills/<skill-name>/...               # optional references and helpers
output-styles/<Name>.md               # Claude Code output styles
settings-public.json                  # settings safe to share publicly
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
```

To track another folder (e.g. `commands/`), add `!commands/`.
