# Sketch-Style Element Templates

These shapes are specific to sketch style (`sketch-style.md`) and aren't in `element-templates.md`. For everything else (plain rectangle, circle, arrow, free-floating text), use that file's templates but set `roughness: 1` and swap `fillStyle: "solid"` for `fillStyle: "hachure"` on filled shapes, using the colors from `sketch-style.md`'s palette table instead of `color-palette.md`.

## Gate-line (lock / freeze / cross-cutting constraint)

A plain solid line crossing the main flow arrow, with a label beside it. It is NOT an arrow and has no arrowhead — it reads as a barrier the flow passes through, not a step the flow takes.

```json
{
  "type": "line",
  "id": "gate_freeze",
  "x": 40, "y": 300,
  "width": 260, "height": 0,
  "strokeColor": "#e03131",
  "backgroundColor": "transparent",
  "fillStyle": "solid",
  "strokeWidth": 2,
  "strokeStyle": "solid",
  "roughness": 1,
  "opacity": 100,
  "angle": 0,
  "seed": 90001,
  "version": 1,
  "versionNonce": 90002,
  "isDeleted": false,
  "groupIds": [],
  "boundElements": null,
  "link": null,
  "locked": false,
  "points": [[0, 0], [260, 0]]
}
```

Pair it with a free-floating label placed just to the right of the line's midpoint, e.g. `"Freeze rows"` or `"Remove lock"`, in the gate red (`#e03131`), `fontSize: 14`. Position the line so it crosses the main pipeline arrow at the point where the constraint is actually acquired or released — don't float it in empty space near the arrow.

## Queue (conveyor of small squares)

Two parallel horizontal lines (the rail) with 3–4 small squares between them (the queued items). Draw the rails first, then the squares evenly spaced between them.

**Rails:**
```json
{
  "type": "line",
  "id": "queue_rail_top",
  "x": 100, "y": 500,
  "width": 160, "height": 0,
  "strokeColor": "#1e1e1e",
  "backgroundColor": "transparent",
  "fillStyle": "solid",
  "strokeWidth": 2,
  "strokeStyle": "solid",
  "roughness": 1,
  "opacity": 100,
  "angle": 0,
  "seed": 90010,
  "version": 1,
  "versionNonce": 90011,
  "isDeleted": false,
  "groupIds": [],
  "boundElements": null,
  "link": null,
  "locked": false,
  "points": [[0, 0], [160, 0]]
}
```
Duplicate with `id: "queue_rail_bottom"`, same `x`/width, `y` shifted down ~40px (the rail spacing — squares sit between the two `y` values).

**Squares** (repeat 3–4 times, evenly spaced along the rail's x-range, sized to fit between the rails with a little margin):
```json
{
  "type": "rectangle",
  "id": "queue_item_1",
  "x": 115, "y": 508, "width": 24, "height": 24,
  "strokeColor": "#2b8a3e",
  "backgroundColor": "#b2f2bb",
  "fillStyle": "hachure",
  "strokeWidth": 1,
  "strokeStyle": "solid",
  "roughness": 1,
  "opacity": 100,
  "angle": 0,
  "seed": 90020,
  "version": 1,
  "versionNonce": 90021,
  "isDeleted": false,
  "groupIds": [],
  "boundElements": null,
  "link": null,
  "locked": false,
  "roundness": null
}
```

The queue's fill color follows the storage/DB color from the palette (green) since a queue is a durable holding place, same conceptual family as the outbox table — unless the diagram already uses green for something else nearby, in which case keep the squares unfilled (`backgroundColor: "transparent"`) rather than reusing a color for two different things.

## Storage / DB rectangle (sharp corners, not rounded)

Same as the default rectangle template, but explicitly `roundness: null` (sharp corners) to visually distinguish a durable table from a rounded pipeline step, and hachure-filled green:

```json
{
  "type": "rectangle",
  "id": "outbox_table",
  "x": 400, "y": 480, "width": 160, "height": 90,
  "strokeColor": "#2b8a3e",
  "backgroundColor": "#b2f2bb",
  "fillStyle": "hachure",
  "strokeWidth": 1,
  "strokeStyle": "solid",
  "roughness": 1,
  "opacity": 100,
  "angle": 0,
  "seed": 90030,
  "version": 1,
  "versionNonce": 90031,
  "isDeleted": false,
  "groupIds": [],
  "boundElements": [{"id": "outbox_table_text", "type": "text"}],
  "link": null,
  "locked": false,
  "roundness": null
}
```

## Worker circle (async process)

```json
{
  "type": "ellipse",
  "id": "worker_1",
  "x": 400, "y": 700, "width": 110, "height": 110,
  "strokeColor": "#c92a2a",
  "backgroundColor": "#ffc9c9",
  "fillStyle": "hachure",
  "strokeWidth": 1,
  "strokeStyle": "solid",
  "roughness": 1,
  "opacity": 100,
  "angle": 0,
  "seed": 90040,
  "version": 1,
  "versionNonce": 90041,
  "isDeleted": false,
  "groupIds": [],
  "boundElements": [{"id": "worker_1_text", "type": "text"}],
  "link": null,
  "locked": false
}
```

## External service (dashed boundary, no fill)

```json
{
  "type": "rectangle",
  "id": "external_service",
  "x": 40, "y": 900, "width": 200, "height": 80,
  "strokeColor": "#1e1e1e",
  "backgroundColor": "transparent",
  "fillStyle": "solid",
  "strokeWidth": 1,
  "strokeStyle": "dashed",
  "roughness": 1,
  "opacity": 100,
  "angle": 0,
  "seed": 90050,
  "version": 1,
  "versionNonce": 90051,
  "isDeleted": false,
  "groupIds": [],
  "boundElements": [{"id": "external_service_text", "type": "text"}],
  "link": null,
  "locked": false,
  "roundness": {"type": 3}
}
```

## Open-questions panel

Not a shape — just free-floating text, left-aligned, black ink, placed in clear whitespace away from the main flow:

```json
{
  "type": "text",
  "id": "open_questions",
  "x": 1200, "y": 100,
  "width": 500, "height": 300,
  "text": "Things to check:\n- <question in the user's own words>\n- <question in the user's own words>",
  "originalText": "Things to check:\n- <question in the user's own words>\n- <question in the user's own words>",
  "fontSize": 16,
  "fontFamily": 3,
  "textAlign": "left",
  "verticalAlign": "top",
  "strokeColor": "#1e1e1e",
  "backgroundColor": "transparent",
  "fillStyle": "solid",
  "strokeWidth": 1,
  "strokeStyle": "solid",
  "roughness": 1,
  "opacity": 100,
  "angle": 0,
  "seed": 90060,
  "version": 1,
  "versionNonce": 90061,
  "isDeleted": false,
  "groupIds": [],
  "boundElements": null,
  "link": null,
  "locked": false,
  "lineHeight": 1.3
}
```
