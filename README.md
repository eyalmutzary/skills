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
- [RTK](https://github.com/rtk-ai/rtk), so shell output is filtered before it reaches the model
- Eyal's status line
- The inbox pane, dev-command permissions, a keep-awake hook, and a twice-weekly worktree sweep
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
| **Implement** | AFK | `/how-to-implement-stack` (`/how-to-implement` per PR: implement + review loop, `/how-to-write-code`, `/how-to-debug-e2e`, open PRs) |
| **Review & merge** | Half | Review stack, `/how-to-babysit-pr`, `/how-to-fix-pr-comments`, then plan the next batch |

Many sessions at once: run `/how-to-orchestrate` in its own session. It starts workers, answers their routine questions, and brings you only what needs you.

Planning steps are a **menu**, not a checklist. Use more of them for large or complex work. See `/eyal-skills:how-to-use-eyal-skills` for guidance.

Matt's plugin supplies `/grill-with-docs` and `/wayfinder`. The setup skill installs it when needed. This repo keeps its own copies of Matt's `/to-spec` and `/to-tickets`, so agents can call them.

## Skills in this repo

| Skill | What it does |
| --- | --- |
| `how-to-setup-eyal-skills` | Configure `~/.claude` (settings, `CLAUDE.md`, RTK, status line, inbox, hooks, worktree sweep, Matt's plugin) |
| `how-to-use-eyal-skills` | “What should I do next?” router for the workflow |
| `how-to-explain` | Explain a concept, bug, or system at your altitude |
| `how-to-triage-new-task` | Decide: implement now, plan first, or ask |
| `how-to-plan` | Run the whole Plan phase: estimate, gather context, spec, plan, tickets, docs PR |
| `how-to-explain-plan` | Walk an implementation plan step by step before coding |
| `how-to-review-plan` | Review an implementation plan before you build it |
| `how-to-write-code` | Coding conventions (shape, naming, frontend notes) |
| `how-to-write-prompt` | Guidelines for reused prompts: skills, system prompts, `CLAUDE.md` |
| `how-to-implement` | One change to one reviewed, verified PR |
| `how-to-implement-stack` | Autonomous batch: reviewed, verified PR stack from a work breakdown |
| `implement` | Build a scoped spec or ticket test-first, then review it |
| `how-to-debug-e2e` | Prove changes locally (Playwright, a mirrored backend) |
| `how-to-QA` | Prove a PR really does what it should, with a QA report |
| `how-to-match-figma` | Turn a Figma design into an exact spec, then list UI gaps after each build |
| `how-to-babysit-pr` | Drive PRs through CI and merge |
| `how-to-orchestrate` | Master session that runs many worker sessions and escalates only what needs you |
| `how-to-inspect` | Watch how the master and workers use the skills, and report gaps |
| `how-to-fix-pr-comments` | Triage review comments as claims, not orders |
| `how-to-help-me-review-pr` | Prep for a human PR review |
| `explain-diff-html` | Rich HTML walkthrough of a diff or PR |

## Output styles

| Style | What it does |
| --- | --- |
| `ELI5` | Plain, short answers; what happened, did it work, what next |

Applied via setup (`outputStyle` in `settings-public.json`), not by the plugin alone.
