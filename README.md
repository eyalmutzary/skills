# Eyal's Claude Code skills

A set of [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skills for planning, implementing, reviewing, and merging software.

## Install

Run these commands inside Claude Code:

```text
/plugin marketplace add eyalmutzary/skills
/plugin install eyal-skills@eyalmutzary
/eyal-skills:how-to-setup-eyal-skills
```

The first command tells Claude where the plugin lives.  
The second installs the skills.  
The third configures the optional extras:

- Claude settings and the ELI5 output style
- A personalized `CLAUDE.md`
- Eyal's status line
- Matt Pocock's planning skills

Restart Claude Code after setup.

Plugin skills start with `eyal-skills:` to avoid conflicts with other plugins. For example:

```text
/eyal-skills:how-to-use-eyal-skills
```

Use that skill whenever you are unsure what to do next. Tell it where you are, such as: “I have a spec but no tickets.”

> This plugin is installed directly from GitHub. It is not yet listed in Anthropic's public plugin directory.

## Workflow (high level)

| Phase | Your attention | Main skills |
| --- | --- | --- |
| **Plan** | Full | Context gathering (`/grill-with-docs`, explorers, `/wayfinder`), design → `/to-spec`, `/how-to-explain-plan`, `/to-tickets` + work breakdown |
| **Implement** | AFK | `/how-to-implement-tasks` (implement + review loop, `/how-to-write-code`, `/how-to-debug-e2e`, open PRs) |
| **Review & merge** | Half | Review stack, `/how-to-babysit-pr`, `/how-to-fix-pr-comments`, then plan the next batch |

Planning steps are a **menu**, not a checklist. Use more of them for large or complex work. See `/eyal-skills:how-to-use-eyal-skills` for guidance.

Matt's plugin supplies `/grill-with-docs`, `/wayfinder`, `/to-spec`, and `/to-tickets`. The setup skill installs it when needed.

## Skills in this repo

| Skill | What it does |
| --- | --- |
| `how-to-setup-eyal-skills` | Configure `~/.claude` (settings, optional `CLAUDE.md`, status line, Matt's plugin) |
| `how-to-use-eyal-skills` | “What should I do next?” router for the workflow |
| `how-to-explain` | Explain a concept, bug, or system at your altitude |
| `how-to-explain-plan` | Walk an implementation plan step by step before coding |
| `how-to-write-code` | Coding conventions (shape, naming, frontend notes) |
| `how-to-implement-tasks` | Autonomous batch: reviewed, verified PR stack from a work breakdown |
| `how-to-debug-e2e` | Prove changes locally (Playwright, monday-mirror, etc.) |
| `how-to-babysit-pr` | Drive PRs through CI and merge |
| `how-to-fix-pr-comments` | Triage review comments as claims, not orders |
| `how-to-help-me-review-pr` | Prep for a human PR review |
| `explain-diff-html` | Rich HTML walkthrough of a diff or PR |

## Output styles

| Style | What it does |
| --- | --- |
| `ELI5` | Plain, short answers; what happened, did it work, what next |

Applied via setup (`outputStyle` in `settings-public.json`), not by the plugin alone.
