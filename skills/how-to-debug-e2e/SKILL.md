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

Mirror work always targets **staging**, never production. Specs create real data.

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
- [curtain.md](curtain.md): run monday's `curtain` e2e specs.

## Workspace pre-flight

A fresh `git worktree` has no `node_modules` and no built package `dist/`. Reuse the
primed checkout when you can. In a new one, finish this gate before any other command:

```bash
cd <repo-root>                       # the root, not a microservice
export PATH="$HOME/.nvm/versions/node/<.nvmrc version>/bin:$PATH"
yarn install; echo "EXIT=$?"         # foreground; a backgrounded install fails silently
yarn build:packages; echo "EXIT=$?"  # every workspace library at once
```

`Cannot find module '.../<pkg>/dist/index.js'` means this gate did not finish. Rerun it.

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

1. Invoke `monday-mirror:monday-mirror`. If the branch under test adds migrations
   (`git diff --name-only origin/master...HEAD | grep migrations`), pass `--db-branching`
   on the first attempt: shared staging lacks the new columns and the first write fails.
2. Wait for `http://localhost:3130/liveness` to return `200`; startup can take several
   minutes. **Confirm the listening PID is the process you started** — a `200` from a
   stale orphan reads as healthy while your own boot is still in progress:

```bash
lsof -nP -iTCP:3130 -sTCP:LISTEN
```

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

## End-to-end loop

1. Run the server loop and verify the backend directly before adding the browser.
2. Run the client loop.
3. Inject **`baggage: routingKey=<key>` per URL** with `page.route(...)` so browser
   requests reach the mirror. Do not use a global header: it breaks third-party CDN
   preflights. Without the header, requests reach the deployed pod and may return
   misleadingly valid but empty or stale data.
4. Change one thing, rerun only the affected check, and repeat.
5. **Restart the mirror after every server code edit.** A file-watcher reboot does not
   re-register the traffic steal, and nothing fails loudly — the local process just stops
   logging. Use the cleanup block below, restart, and re-poll liveness.

## Prove it worked

A captured client request does not prove the server parsed it. Confirm both:

- **Client**: the outgoing request body.
- **Server**: a log line from inside the code path under test, from that run.

Logs are sanitized and omit field values, so add a temporary tagged log such as
`logger.info({ value }, 'TEMP_DEBUG ...')` to see a literal one. Remove it and check
`git status` before finishing.

## Clean up

Stop only the processes started for this investigation:

```bash
pkill -f monday-mirror; pkill -f "mirrord intproxy"
lsof -nP -iTCP:3130   # confirm nothing lingers; kill leftover PIDs if the port stays held
```

## Troubleshooting

- **UI is missing**: confirm the feature flag for the impersonated account in that
  environment; flag state differs between staging and production.
- **Local edits do not appear**: check `--disable-web-security`; the browser may be
  using the deployed bundle.
- **Data is empty or stale in e2e mode**: verify per-URL `baggage`; the request may
  have reached the deployed pod.
- **Proxy call returns a misleading `200`**: inspect `x-upstream-status` and the body.
- **Ports 3130/8910 refuse connections**: recheck liveness; restart the mirror if needed.
- **`Failed to fetch dynamically imported module`**: Vite returned `504 Outdated Optimize
  Dep`. Restart the dev server after any workspace package rebuild.
- **Account is inaccessible**: verify that impersonation uses a shared test account.
- **No server logs for a request that happened**: interception broke, not the feature.
  Restart the mirror.

## Gotchas

Silent failures that look like bugs in the code under test.

- **A file-watcher reboot breaks the traffic steal.** Zero log lines, no error. Restart
  the mirror after any server edit.
- **A stale mirrord session holds the steal lock.** The log shows `conflicts with existing
  steal(...) lock in session <ID>`, and traffic may route to an unpatched pod. Fix with
  `mirrord operator status`, then `mirrord operator session stop --id <ID>`.
- **A service can have several replicas.** A steal covering one leaves the rest on
  deployed code, so identical runs disagree.
- **Logs are sanitized.** A value missing from the logs was not necessarily missing from
  the request.
- **Wrong Node version fails late or silently.** Use the service's `.nvmrc`. mirrord runs
  the app under `sh -c`, which skips a lazy nvm shim and falls back to the default Node,
  so export the absolute bin dir on `PATH` yourself.
- **`curtain --list` reporting `0 tests` and no error is a swallowed error.** It hides
  stderr from its internal `playwright test --list`. Run that command directly to see it.
- **You may be reading the wrong checkout.** With a worktree in play, print the absolute
  path beside any code fact you report; `~/Development/...` is the wrong tree.
- **Pre-flight checks that look hung may be macOS sleep.** Compare `ps -o etime -p <pid>`
  with the wall clock, and launch under `caffeinate -i`.
- **A `404` from `http://localhost:8910/` is healthy** if `/proxy/...` works.
- **Your own capture logic can be the bug.** If an assertion sees no request that
  demonstrably happened, check the trace or server log before blaming the feature.
