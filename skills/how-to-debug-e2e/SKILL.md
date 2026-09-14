---
name: how-to-debug-e2e
description: Run a full autonomous e2e debug loop — mirror a staging backend locally, call its endpoints, read its logs, open a real browser against the local frontend, and iterate on fixes. Use when asked to debug something end to end, reproduce a bug in a real browser against staging data, or "run the e2e loop" for a monorepo service + microfrontend pair. TRIGGER on "debug e2e", "run e2e loop", "reproduce this in a browser", "mirror and debug", "test this against staging".
user-invocable: true
allowed-tools: Read, Glob, Bash, AskUserQuestion, Skill
compatibility: Requires monday-mirror, kubectl, tsh, Playwright (or system Chrome), Teleport access to the target cluster.
---

# How to Debug E2E

Autonomous loop: real backend (mirrored staging) + real frontend (local dev server) +
real browser, driven by you, with logs and endpoint calls as feedback. This skill is
the glue between three things that already exist — don't reinvent them:

- **`monday-mirror:monday-mirror`** — starts/operates the mirrored backend.
- **`monday-mirror:monday-mirror-feedback-loop`** — deeper verification (Kafka, OpenSearch,
  Datadog) once the mirror is already running. Use it instead of this skill for those.
- [mf-start.md](mf-start.md) — starts the local frontend Trident/Vite dev server for any
  `mf-*` (worktree symlinks, port cleanup, compile poll). Prefer a repo-specific start
  skill if one exists for that MF; otherwise follow `mf-start.md`.

If any of those skills exist in the current repo/plugins, invoke them for their step
instead of copy-pasting their commands here — they're the source of truth and may have
moved on since this was written.

## Step 0 — Ask before guessing

Do not invent these. Ask the user (one question, multiple fields, or a couple of quick
questions) if any are unclear from the conversation or the code:

1. **Which backend service** to mirror (e.g. `workflow-chat`), and **which frontend/UI**
   it powers (which microfrontend, which page/panel to open once logged in).
2. **Which staging account/user to impersonate** — `x-impersonated-account-id` /
   `x-impersonated-user-id`. Never use the user's own personal staging account for a
   browser session; ask if there's a shared test account for this purpose.
3. **Any feature flag** that gates the UI. If the UI never shows up, this is the first
   thing to check — not a frontend bug until this is ruled out.
4. What "done" looks like — a specific repro (bug), or an open-ended poke-around.

Everything below assumes these are resolved.

## Step 1 — Clear stale state

Old servers and locks from a previous session are the #1 cause of "it's just not working":

```bash
lsof -nP -iTCP -sTCP:LISTEN | grep -E ':(3002|3130|8910|8900|3000|8080|4000)\b'
pkill -f "monday-mirror" 2>/dev/null; pkill -f "mirrord intproxy" 2>/dev/null; sleep 2
```
Kill anything found on those ports before continuing, unless it's a healthy mirror/dev
server you intend to reuse.

## Step 2 — Start the mirror

Invoke `monday-mirror:monday-mirror` (Skill tool). It handles Teleport/kube pre-flight,
routing key resolution (`~/.monday-mirror/{routingKey,userEmail,kubeContext}`), and
launch. Wait for `http://localhost:3130/liveness` → `200` before moving on — this can
take a few minutes, don't assume it's instant.

**Gotchas not always obvious from the mirror's own output:**
- Node version may need pinning (check the service's `.nvmrc`; `nvm use` it) before
  launch — a wrong Node version fails silently or late.
- `http://localhost:8910/` returning `404` is healthy — it means the proxy is up but `/`
  isn't a real route. Only worry if `/proxy/...` calls also fail.

## Step 3 — Sanity-check the backend with curl before touching a browser

Read `monday-mirror`'s `references/dev-server-api.md` for the exact header set
(`x-target-app-name`, `x-use-impersonation`, `x-impersonated-account-id`,
`x-impersonated-user-id`, `x-impersonated-app-name: monday`, `baggage: routingKey=<key>`).

```bash
curl -s "http://localhost:8910/proxy/<path>" \
  -H "x-target-app-name: <service>" \
  -H "x-use-impersonation: true" \
  -H "x-impersonated-account-id: <accountId>" \
  -H "x-impersonated-user-id: <userId>" \
  -H "x-impersonated-app-name: monday" \
  -H "baggage: routingKey=<key>" -i
```

**Trap:** the proxy layer often returns HTTP `200` no matter what. Check the response
for an `x-upstream-status` header (or the actual response body) for the real status —
otherwise a broken endpoint looks fine.

Confirm the endpoint responds correctly before wiring up a browser. If it's wrong here,
fix it here — don't debug backend logic through a browser.

## Step 4 — Start the frontend dev server

Follow [mf-start.md](mf-start.md) (or a repo-specific start skill for that MF if one
exists). It resolves `$MF_NAME` / `$PORT`, handles worktree `node_modules` symlinks,
clears the port, and polls the bundle URL until Vite has compiled — do not treat
"process started" as ready.

## Step 5 — Drive a real browser

Two flags are load-bearing and easy to lose — see [[wfc-browser-debug-loop]] memory /
`curtain-core`'s own `default.config.mjs` for where these come from:

1. **`--disable-web-security`** on the Chrome launch. Without it, Chrome blocks the
   local-dev-server fetch as a private-network violation, and the page silently falls
   back to the *deployed* bundle — your local changes never actually load, with no error.
2. **`baggage: routingKey=<key>` injected per-URL** via `page.route(...)`, not as a
   global header — a global header breaks preflight on third-party CDN calls. Without
   it, requests hit the deployed pod instead of your mirror: you'll see `200`s with
   empty/stale data, which looks exactly like a frontend bug but isn't.

Auth: reuse the platform's existing session/login helper if one exists (e.g.
`curtain-core`'s `storageState.json` flow) rather than scripting a manual login.

Playwright environment notes: if no browser binaries are installed
(`~/Library/Caches/ms-playwright` empty), launch with `channel: 'chrome'` to use the
system browser instead of downloading one.

## Step 6 — Read logs and iterate

- Mirror backend logs print to the terminal/log file you launched it into — tag your own
  log lines (`logger.info({ tag: 'debug' }, ...)`) around the code path you're chasing;
  background workers often log nothing by default.
- Browser-side: check the Playwright page's console/network events, not just visual
  state — an empty SSE stream or a silently-swapped bundle won't show as a UI error.
- Make a change, re-run only the affected step (usually Step 3 or Step 5 — you rarely
  need to restart the mirror), confirm, repeat.

## Step 7 — Clean up

```bash
pkill -f monday-mirror; pkill -f "mirrord intproxy"
lsof -nP -iTCP:3130   # confirm nothing lingers; kill leftover PIDs if the port stays held
```

## Quick troubleshooting

| Symptom | Likely cause | Check |
|---|---|---|
| UI panel never appears | Feature flag off for the impersonated account | Confirm the flag before assuming a frontend bug |
| Local edits don't show in browser | Chrome blocked the dev-server fetch, fell back to deployed bundle | Add `--disable-web-security` |
| Endpoint returns 200 but data is empty/stale | Request hit the deployed pod, not the mirror | Check per-URL `baggage: routingKey` is actually attached |
| curl proxy call "succeeds" but is wrong | Proxy masks real status as 200 | Read `x-upstream-status`, not the HTTP status |
| `Connection refused` on 3130/8910 | Mirror not up yet, or died | Re-check liveness; re-run Step 2 |
| Test/browser session can't reach staging account | Used personal account instead of a shared test account | Ask which test account to impersonate |
