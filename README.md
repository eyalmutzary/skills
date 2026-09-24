# Eyal's Claude Code skills

Personal [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skills and config: a practical workflow for planning, implementing, and merging software with agents. Built on [Matt Pocock's skills](https://github.com/mattpocock/skills), wrapped into habits that work together.

## Quick start (plugin — recommended)

1. **Add the marketplace and install the plugin** — in Claude Code:

   ```
   /plugin marketplace add eyalmutzary/skills
   /plugin install eyal-skills@eyalmutzary
   ```

   Or from the shell:

   ```bash
   claude plugin marketplace add eyalmutzary/skills
   claude plugin install eyal-skills@eyalmutzary
   ```

2. **Configure your machine** — skills load from the plugin as `/eyal-skills:<skill-name>`. Settings, `CLAUDE.md`, and the status line still live under `~/.claude`. Run:

   ```
   /eyal-skills:how-to-setup-eyal-skills
   ```

   Answer the prompts (skip copying skills locally if you keep the plugin). The agent merges settings, optionally installs the status line and personalized `CLAUDE.md`, and installs `mattpocock-skills` when planning skills are missing.

3. **Restart** Claude Code after setup.

4. **When stuck** — `/eyal-skills:how-to-use-eyal-skills` and say where you are (e.g. “I have a spec but no tickets”).

Do not install the plugin and a full local copy of the same skills — pick one source to avoid duplicates.

## Quick start (local copy)

For an editable copy under `~/.claude/skills` (no plugin):

```bash
git clone --depth 1 https://github.com/eyalmutzary/skills /tmp/eyal-skills
mkdir -p ~/.claude/skills
cp -R /tmp/eyal-skills/skills/how-to-setup-eyal-skills ~/.claude/skills/
```

Then run `/how-to-setup-eyal-skills` and choose **Yes** for the local skill copy.

## Workflow (high level)

| Phase | Your attention | Main skills |
| --- | --- | --- |
| **Plan** | Full | Context gathering (`/grill-with-docs`, explorers, `/wayfinder`), design → `/to-spec`, `/how-to-explain-plan`, `/to-tickets` + work breakdown |
| **Implement** | AFK | `/how-to-implement-tasks` (implement + review loop, `/how-to-write-code`, `/how-to-debug-e2e`, open PRs) |
| **Review & merge** | Half | Review stack, `/how-to-babysit-pr`, `/how-to-fix-pr-comments`, then plan the next batch |

Planning steps are a **menu**, not a checklist — scale with feature size and how long you will run unattended. Details: `/eyal-skills:how-to-use-eyal-skills` (or `/how-to-use-eyal-skills` if you use a local copy).

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
