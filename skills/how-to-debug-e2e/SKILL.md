---
name: how-to-debug-e2e
description: Use when debugging client, server, or end-to-end behavior locally with Playwright and/or a mirrored staging backend.
user-invocable: true
allowed-tools: Read, Glob, Bash, AskUserQuestion, Skill
compatibility: Client debugging requires Playwright or system Chrome; server debugging requires monday-mirror, kubectl, tsh, and Teleport access.
---

# Debug Locally

Choose the smallest feedback loop that can answer the question. Do not start a mirror
for a client-only problem or open a browser for a server-only problem.

## Choose a mode

- **Client**: use Playwright to reproduce UI behavior, inspect console/network events,
  or verify local frontend changes against the deployed backend.
- **Server**: use monday-mirror, curl, and logs to verify an endpoint or backend code
  path without a browser.
- **End to end**: combine both when the behavior depends on local client and server code,
  or when the failing layer is unknown.

Infer required inputs from the conversation and code; ask only for unresolved details:
the success criteria, relevant service or frontend, page or endpoint, shared staging
test account and user IDs, and feature flags. Never use the user's personal staging
account for browser debugging.

Use these workflows as their source of truth:

- **`monday-mirror:monday-mirror`**: start and operate the mirror.
- **`monday-mirror:monday-mirror-feedback-loop`**: inspect Kafka, OpenSearch, or Datadog
  after the mirror is running.
- [mf-start.md](mf-start.md): start a Trident/Vite `mf-*` frontend. Prefer a
  repo-specific start skill when available.

## Client loop: Playwright

1. If testing local frontend changes, start the frontend with its repo-specific skill
   or [mf-start.md](mf-start.md). Wait for the bundle URL; a running process does not
   mean Vite finished compiling.
2. Reuse an existing session/login helper, such as `curtain-core`'s
   `storageState.json` flow.
3. Drive the real page with Playwright. Inspect console and network events as well as
   visible state; empty streams and silently swapped bundles may not show UI errors.
4. When loading a local bundle, launch Chrome with **`--disable-web-security`**.
   Otherwise private-network checks may silently fall back to the deployed bundle.

If Playwright browser binaries are unavailable, launch with `channel: 'chrome'` to use
system Chrome.

## Server loop: monday-mirror, curl, and logs

Clear stale mirror processes first; reuse only a verified healthy mirror:

```bash
lsof -nP -iTCP -sTCP:LISTEN | grep -E ':(3002|3130|8910|8900|3000|8080|4000)\b'
pkill -f "monday-mirror" 2>/dev/null; pkill -f "mirrord intproxy" 2>/dev/null; sleep 2
```

1. Invoke `monday-mirror:monday-mirror`.
2. Wait for `http://localhost:3130/liveness` to return `200`; startup can take several
   minutes.
3. Read `monday-mirror`'s `references/dev-server-api.md` for the current headers, then
   call the endpoint directly:

```bash
curl -s "http://localhost:8910/proxy/<path>" \
  -H "x-target-app-name: <service>" \
  -H "x-use-impersonation: true" \
  -H "x-impersonated-account-id: <accountId>" \
  -H "x-impersonated-user-id: <userId>" \
  -H "x-impersonated-app-name: monday" \
  -H "baggage: routingKey=<key>" -i
```

The proxy may return `200` for upstream failures. Check `x-upstream-status` and the
response body. Inspect backend logs and add tagged logs around silent code paths when
needed.

Mirror gotchas:

- Use the service's `.nvmrc`; the wrong Node version may fail late or silently.
- A `404` from `http://localhost:8910/` is healthy if `/proxy/...` calls work.

## End-to-end loop

1. Run the server loop and verify the backend directly before adding the browser.
2. Run the client loop.
3. Inject **`baggage: routingKey=<key>` per URL** with `page.route(...)` so browser
   requests reach the mirror. Do not use a global header: it breaks third-party CDN
   preflights. Without the header, requests reach the deployed pod and may return
   misleadingly valid but empty or stale data.
4. Change one thing, rerun only the affected check, and repeat. Restart the mirror only
   when necessary.

## Clean up

Stop only the processes started for this investigation:

```bash
pkill -f monday-mirror; pkill -f "mirrord intproxy"
lsof -nP -iTCP:3130   # confirm nothing lingers; kill leftover PIDs if the port stays held
```

## Troubleshooting

- **UI is missing**: confirm the feature flag for the impersonated account.
- **Local edits do not appear**: check `--disable-web-security`; the browser may be
  using the deployed bundle.
- **Data is empty or stale in e2e mode**: verify per-URL `baggage`; the request may
  have reached the deployed pod.
- **Proxy call returns a misleading `200`**: inspect `x-upstream-status` and the body.
- **Ports 3130/8910 refuse connections**: recheck liveness; restart the mirror if needed.
- **Account is inaccessible**: verify that impersonation uses a shared test account.
