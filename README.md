# Eyal's Claude Code skills

Personal [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skills and config: a practical workflow for planning, implementing, and merging software with agents. Built on [Matt Pocock's skills](https://github.com/mattpocock/skills), wrapped into habits that work together.

## Quick start

1. **Bootstrap** — copy one folder so Claude can run the installer:

   ```bash
   git clone --depth 1 https://github.com/eyalmutzary/skills /tmp/eyal-skills
   mkdir -p ~/.claude/skills
   cp -R /tmp/eyal-skills/skills/how-to-setup-eyal-skills ~/.claude/skills/
   ```

2. **Install** — in Claude Code, run:

   ```
   /how-to-setup-eyal-skills
   ```

   The agent will ask a few questions (status line and `CLAUDE.md` are optional but recommended), then merge settings, copy all skills and output styles, install [ccstatusline](https://www.npmjs.com/package/ccstatusline) if you want it, and install `mattpocock-skills` when planning skills are missing.

3. **Restart** Claude Code after setup.

4. **When stuck** — run `/how-to-use-eyal-skills` and say where you are (e.g. “I have a spec but no tickets”). It recommends the next step in the workflow.

## Workflow (high level)

| Phase | Your attention | Main skills |
| --- | --- | --- |
| **Plan** | Full | Context gathering (`/grill-with-docs`, explorers, `/wayfinder`), design → `/to-spec`, `/how-to-explain-plan`, `/to-tickets` + work breakdown |
| **Implement** | AFK | `/how-to-implement-tasks` (implement + review loop, `/how-to-write-code`, `/how-to-debug-e2e`, open PRs) |
| **Review & merge** | Half | Review stack, `/how-to-babysit-pr`, `/how-to-fix-pr-comments`, then plan the next batch |

Planning steps are a **menu**, not a checklist — scale with feature size and how long you will run unattended. Details: `/how-to-use-eyal-skills`.

Matt's plugin supplies `/grill-with-docs`, `/wayfinder`, `/to-spec`, and `/to-tickets`. The setup skill installs it when needed.

## Skills in this repo

| Skill | What it does |
| --- | --- |
| `how-to-setup-eyal-skills` | One-shot install of this suite into `~/.claude` |
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

Referenced in `settings-public.json` as `outputStyle`.
