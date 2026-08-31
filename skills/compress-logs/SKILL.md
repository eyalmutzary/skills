---
name: compress-logs
description: Manually invoked only — do NOT auto-trigger.
---

# compress-logs

## Overview

Raw structured logs are mostly noise: repeated metadata, routing chains, IDs duplicated on every line, and routine boilerplate. This is a **reformatting** task — rewrite the logs into a lean form and hand them back. The reader interprets them; you do not.

## Output Contract

Your entire response IS the reformatted log. The first characters you write are `app=` (the header line). You write the four sections below and nothing else — no opening sentence, no analysis, no closing question.

You are a formatter, not an analyst. Do not say what the logs "show", "stand out", or "suggest". Do not identify bottlenecks or root causes. Do not ask what the user is debugging. Reformat and stop.

**Red flags — if you catch yourself doing any of these, delete it and restart with the `app=` header:**
- Writing a sentence before the header line
- "Here's what stands out / the logs show..."
- Pointing out a bottleneck, pattern, or expected behavior
- Ending with "What are you trying to debug?"
- Putting a feature-flag eval on a timeline line (flags go in the footer only)
- Splitting one group of identical lines into more than one collapsed line

## When to Use

- User pastes a wall of JSON logs or multi-line structured logs
- Lines carry heavy payloads (`hostname`, `pid`, `trace_id`, `attributions.*`)
- The same service/env metadata and IDs repeat across many lines

## Output Structure

Produce exactly these four sections, in order. The footer is the last thing you write — produce no text after it.

**1. Header** — metadata identical across all logs, on one line:
`app=<app> env=<env> region=<region> account_id=<id> user_id=<id>`

**2. Legend** — list an ID here only if it appears on 2+ timeline lines. Define each once. IDs that appear once are inlined in the timeline instead, never listed here:
```
trace_id_1 = <value>
request_id_1 = <value>
```

**3. Timeline** — level-30 and level-50 logs in time order, every one represented, each on one lean line. Collapse repeats per the rules below so "represented" can mean a `×N` line:
```
[HH:MM:SS.mmm] <lvl> <tag>: <msg> | <result/business fields>  <id refs>
  └─ <error message, one line>      ← for level 50
```

**4. Summary footer** — kept out of the timeline. Two short lists:
- **Warnings (level 40):** one bullet per *distinct* warning message (deduped across the whole dump), with a count when it repeats.
- **Flags evaluated:** one bullet per distinct flag, with the value it resolved to. Mention each flag once.
```
Warnings (40):
- <message> ×N

Flags evaluated:
- <flag-name> = <value>
```

## What to Keep Per Timeline Line

Time (no date), level number, tag/class, msg, and the fields that carry signal: result values (`count`, `duration`, `status`), business IDs (`board_id`, `item_id`, `workflow_id`, `host_instance_id`), SQL or GraphQL operation, and id references. For level 50, add the error message on a `└─` line.

Fold everything else (`hostname`, `pid`, `v`, `attributions.*`, `baggage`, `sanitized`, full stack traces, `node_modules` paths) into the header or drop it.

## Rules By Level

- **30 (info) and 50 (error): represent every one.** None are filtered out. A group of identical 30s collapsed into a `×N` line still represents all of them — the count accounts for each.
- **40 (warn): move to the footer's Warnings list.** One bullet per distinct message, deduped, with a count.
- **Feature-flag evaluations (any level): footer Flags list only — they produce NO timeline line.** A flag-eval log's entire output is its footer entry. List each distinct flag once with the value it resolved to.

## Collapsing Repetition

Group lines that share the same `tag` + `msg` (and same distinguishing field, e.g. flag name). Collapse the **whole** group into a single line — all N members, never a partial split — using a time range for the timestamp: `[HH:MM:SS–SS] <lvl> <tag>: <msg> ×N`. Apply this even when the lines are spread across different requests and even when their trace/request IDs differ.

- When the grouped lines carry distinct one-off IDs, append `(N distinct reqs)` and do not alias those IDs.
- An ID that survives on a single timeline line stays inline as `trace=<first8>` / `req=<first8>`, and is omitted from the legend.


## Example

Raw lines carry ~25 fields each. One request_id/trace_id recurs across several lines (alias it); a burst of cache hits each carry their own one-off IDs (collapse, don't alias); flag evals repeat per request (move to footer); one warning fires several times.

Compressed:
```
app=svc env=prod region=us-east-1 account_id=42 user_id=7
trace_id_1 = 7729d6b237d415f9338b8d656e9b18e9
request_id_1 = 16e8c04e-f331-97e1-880d-b9deae84dc82

[12:00:01.100] 30 graphql: Get records | duration=2016ms  trace_id_1 request_id_1
[12:00:02.300] 30 db: count active | count=2  trace_id_1 request_id_1
[12:00:03–07]  30 cache: Cache hit ×6 (6 distinct reqs)
[12:00:09.100] 50 api: Handler crashed | trace_id_1
  └─ Cannot read property 'id' of undefined

Warnings (40):
- Cache refresh failed ×4

Flags evaluated:
- new-checkout-flow = true
- legacy-billing = false
```
