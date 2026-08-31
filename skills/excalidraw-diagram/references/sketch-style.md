# Sketch Diagram Style

Whiteboard-sketch register for the user's own system design or in-progress thinking — not a polished teaching diagram. Parent `SKILL.md` covers JSON structure, the render-view-fix loop, and `render_excalidraw.py`. This file only covers what's different: layout philosophy, roughness, shape vocabulary, color, and text density.

## When this applies vs. default mode

Ask: **who is this diagram for?**

- **For the user themselves, mid-design** (working through a mechanism, capturing a flow before implementing it, thinking out loud) → this style.
- **For someone else with no context** (a teaching diagram, a doc, a presentation) → default comprehensive mode, with evidence artifacts, section headers, and multi-zoom teaching structure.

The tell: if the user is describing something *they* are actively designing and wants a fast visual to reason with, use this style even if they don't say "sketch" explicitly. If they want to explain a finished concept to a reader with zero context, use default mode.

## Core idea: the diagram's shape IS the system's shape

Default mode often organizes a diagram like a document outline — a title, a row of phase boxes, then subsections for each topic. That's an outline turned into shapes.

This style does the opposite: **the layout traces the actual path the request or data takes through the system.** If a request comes in, flows through three synchronous steps, then hands off to an async worker that calls back out to an external service, draw exactly that path — synchronous steps down the middle, async offshoots branching off where they actually branch off, loops drawn as loops. Someone should be able to follow the arrows and be tracing the real control/data flow, not a table of contents.

Practical default: **vertical, top-to-bottom**, because most request flows read as "trigger happens, then this, then this." Only go horizontal or radial if the actual topology is naturally lateral (e.g., a fan-out to several independent consumers) — let the system's shape decide, not a template.

## Visual settings: sketchy, not clean

This is the single biggest visual difference from default mode (`roughness: 0`). Here, use:

- `roughness: 1` on every shape and line (hand-drawn wobble).
- `fillStyle: "hachure"` on filled shapes (diagonal hand-drawn hatching), not `"solid"`.
- Smaller text than teaching sizes — `fontSize: 16` for shape labels, `fontSize: 14`–`16` for side annotations, and **no large title treatment**. There is no diagram title, no subtitle, no section headers, no dashed section dividers. The diagram just starts at the trigger and runs.
- `strokeWidth: 1`–`2` throughout; nothing needs to be bold. This isn't a hero-and-supporting-cast hierarchy — every pipeline step is drawn at roughly the same visual weight, because in the user's own thinking they're all just "the next thing that happens."

## Shape vocabulary (fixed — don't improvise new shapes)

Unlike the general shape-meaning table, this style uses one **fixed, small vocabulary**. Reuse it exactly so diagrams stay recognizable across sessions:

| Shape | Means | Notes |
|---|---|---|
| Rounded rectangle (hachure fill) | A step in the main synchronous pipeline | The spine of the diagram — one per phase/step, connected top-to-bottom with plain arrows |
| Circle (hachure fill) | A background worker, sweep, or async process | Never a synchronous step — circles are always "something running independently, on its own clock" |
| Dashed rectangle, no fill | An external service or system boundary | Something outside the codebase being diagrammed — draw it off to the side, connected by an arrow labeled with the actual call (see below) |
| Row of small squares between two parallel horizontal lines | A literal queue | The two lines are the "conveyor belt" / rail; the squares are queued items. Use this instead of a generic rectangle labeled "Queue" — the shape should look like a queue |
| A plain colored horizontal line crossing the main flow arrow, with a short label, and NO enclosing box | A cross-cutting constraint or lock/gate | E.g. a mutex acquired/released, a freeze taken. Draw it as a barrier the flow arrow passes through, not as a step in the pipeline — it's a constraint on the flow, not a thing the flow does. See reference template below. |

Do not invent additional shapes for this style (no diamonds for decisions, no clouds, no trees) — the point is a small, memorized vocabulary that reads instantly once the user knows it, the same way their own whiteboard shorthand does.

See `sketch-element-templates.md` for copy-paste JSON for sketch-specific shapes (gate-line, queue-conveyor, storage rect, worker circle, external dashed box, open-questions panel).

## Color: three hachure colors, plus black ink, plus red for gates

Default mode pulls from `color-palette.md` with a color for every category. This style uses far less:

| Purpose | Stroke | Fill |
|---|---|---|
| Synchronous pipeline step (rounded rect) | `#1e3a5f` | `#a5d8ff` hachure (light blue) |
| Storage / DB / durable table (squarish rect, sharp corners) | `#2b8a3e` | `#b2f2bb` hachure (light green) |
| Async worker / sweep (circle) | `#c92a2a` | `#ffc9c9` hachure (light pink) |
| Gate / lock / constraint line | `#e03131` solid | — (it's a line, not a filled shape) |
| Everything else — arrows, labels, external-service dashed box, open-questions text | `#1e1e1e` (near-black ink) | transparent |

That's the whole palette. No amber, no purple, no dark evidence-artifact panels, no text-hierarchy color tiers (title/subtitle/body). Free-floating text is just black — the *position* and *shape vocabulary* carry the meaning, not color-coded typography.

## Text: terse, and let arrows carry information

Default mode writes full sentences so a diagram is self-explanatory to a reader with no context. This style assumes the reader is the user, mid-thought, so it inverts that:

- **Shape labels are one to three words.** ("Stage", "Commit", "Internal jobs worker") Never a sentence.
- **Arrow labels carry the operational specifics** that would otherwise bloat a box: an endpoint path (`/subscribe`, `/unsubscribe`), a concrete fact about timing or behavior (`abandon_staged_subscriptions — 60s delay`, `Consumes tasks every N seconds`), or what gets written where (`writes all post-promotion jobs`). If there's a real fact worth capturing, put it on the arrow it belongs to rather than inventing a text block near a box.
- **Side annotations are short bullet lists, not prose** — three or four short lines next to a shape, plain black text, no bullet shape needed if the line breaks already separate them. Never wrap these in a container.
- **No evidence artifacts.** No JSON payload boxes, no code snippets, no error-code tables, no dark syntax-highlighted panels. If a concrete detail matters enough to write down, it goes on an arrow or a short side list, not a formatted artifact.

## The "open questions" panel

When the user's design has unresolved concerns — which, if this is a working sketch, it usually does — give them an explicit, visually separate space for it:

- Plain black text, **no box, no hachure fill, no shape at all.**
- Placed off to the side of the main flow (commonly to the right, with clear whitespace separating it from the pipeline), so it reads as "parking lot," not as part of the mechanism.
- Written informally, in the first person, as real open questions — `"if we have draft automation subscribed, can it run? (although it's off in the DB?)"` — not polished risk-register language. Preserve the user's actual uncertainty and phrasing register rather than smoothing it into formal prose.
- A short header line like `Things to check:` is enough; don't dress it up further.

If the user hasn't surfaced any open questions, don't manufacture some just to fill the panel — only include it when there's real unresolved uncertainty to capture.

## What this style deliberately omits

Compared to comprehensive/technical mode, skip all of the following unless the user explicitly asks for it:

- Diagram title and subtitle
- Named section headers and dashed dividers between sections
- Evidence artifacts (code/JSON panels, error-contract tables)
- Correctness-invariant checklists or "what a reviewer must believe" framing
- Before/after problem-statement comparisons
- Rollout timelines, percentage stages, or anything aimed at convincing a reader rather than helping the author think

These aren't missing by oversight — a working sketch that included all of that would stop being fast to produce and fast to read, which defeats the point.

## Workflow

1. Confirm this is the right register (see "When this applies" above) — for the user's own design/thinking, not a teaching deliverable.
2. Trace the actual topology: what triggers this, what happens synchronously, where does it hand off to something async, does it loop back anywhere, what's external. Sketch that path mentally before writing JSON — this determines layout, not a section template.
3. Build the JSON using the shape vocabulary and palette above, terse labels, arrow-carried detail. For anything larger than a handful of shapes, still build it in one pass if it fits comfortably — this style produces much smaller diagrams than comprehensive mode, so the mandatory section-by-section build is usually unnecessary here, but revert to section-by-section if the diagram is genuinely large.
4. Add the open-questions panel if there are real unresolved concerns.
5. Render and view exactly as the parent skill describes (`render_excalidraw.py`, read the PNG, fix defects, re-render) — the render-view-fix loop applies identically regardless of style. Check specifically that hachure fills render distinctly from each other and that gate-lines are visually readable as barriers crossing the flow, not mistaken for arrows.
