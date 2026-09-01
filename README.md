# Claude skills

Personal [Claude Code](https://docs.anthropic.com/en/docs/claude-code) / agent skills from `~/.claude/skills`.

This repo tracks a whitelist of the Claude home directory — currently `skills/` and `CLAUDE.md`. Other paths can be added later by un-ignoring them in `.gitignore`.

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

## Layout

```
skills/<skill-name>/SKILL.md   # required entry point
skills/<skill-name>/...        # optional references and helpers
```

## Whitelist

Root `.gitignore` ignores everything, then allows specific paths:

```gitignore
/*
!.gitignore
!README.md
!skills/
```

To track another folder (e.g. `commands/`), add `!commands/`.
