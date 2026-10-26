---
name: how-to-match-figma
description: Use when UI must match a Figma design pixel-perfect — to turn Figma into an exact spec before you build, and to compare the live UI to it after each build round and list the gaps.
---

# How to Match Figma

The goal is an exact match where Figma gives the value. When Figma is not consistent (two cards with different padding, a token that does not exist), you decide and write down why.

This skill does not build. It gives the builder a spec, and after each build round it gives a gap list. `<id>` below is the ticket or task id.

## 1. Read Figma into a spec

Write `/tmp/<id>-figma-spec.json` (format: see the script header in `scripts/figma-check.mjs`).

1. `create_session` with the fileKey and a short description. Pass its sessionId on every call.
2. `get_metadata` on the **parent frame** of the target. You get the tree, sizes, and positions (relative to each parent) in a few KB. Ignore nodes with `hidden="true"`. Never call it on a page or a big frame; the output can reach 1M+ characters.
3. `get_design_context` on each small node you need, with `excludeScreenshot: true`. You get tokens (`var(--token, #fallback)`), fonts, padding, gaps, radius, and designer annotations (`data-development-annotations`). Read the annotations: they hold behavior.
4. `get_screenshot` of each area you will compare. Download it with curl to `/tmp/<id>-figma/<area>.png`.
5. Write the spec:
   - `root`: a selector for the area. All other selectors are scoped inside it (`:scope` is the root itself).
   - `elements`: every visible element, with each value Figma gives.
   - `relations`: gaps to neighbors, insets inside the parent, and alignment (`centerX`/`centerY`). These catch most real bugs.
   - `areas`: the screenshots to compare.
   - One spec per state (hover, empty, error, loading) that Figma shows.

Write the tokens next to the numbers in your notes. The builder must use the token, not the hex.

## 2. Compare

Use the repo's UI-runner skill to open the page (most repos have one). From its steps file call (`<skill dir>` is this skill's folder, as an absolute path):

```js
const { figmaCheck } = await import('<skill dir>/scripts/figma-check.mjs');
await figmaCheck(page, { spec: '/tmp/<id>-figma-spec.json', out: '/tmp/<id>-figma/round-<n>' });
```

- The numbers table in `report.md` is the gate. Every row must be ✅.
- Then read each `<area>-compare.png` (Figma | browser | diff, scaled 2x). It catches what the spec missed: wrong icon, missing element, wrong order. When you find a miss, add it to the spec.
- Read only the focused area images.

## 3. List the gaps

Append a section per round to `/tmp/<id>-figma-gaps.md`. One line per gap: element, property, Figma value and token, actual value, and the likely cause in the code. Mark each gap: fix, or decided (with the reason). Give this file to the builder, and run step 2 again after the fix.

Stop when the table is all ✅ and the images show no unexplained difference.

Tell the caller when a gap stays open after 2 rounds, or when the fix needs a hack: an override of a design-system component, `!important`, or a fixed px where Figma uses a token. Say what blocks it and what you recommend.

## Gotchas

- Figma screenshots export at 1x only. Take browser screenshots at device pixel ratio 1, or the script scales them.
- The app container is often a different width from the Figma frame. Check fluid elements with relations (`centerX`, `left`, `right`), not absolute x or width.
- A Figma text box has the width of its container. A DOM text element is often only as wide as its text. For text, check height, font values, and position, not width.
- A class name can match elements outside your area. Scope with `root`. The script marks a selector with more than one match as a fail.
- An element under another element (an overlap) shows the top element in the browser screenshot. Compare a smaller area, or trust the numbers for the covered part.
- Live data differs from Figma text (names, list items). The diff % is then high. Read the image for layout, not text.