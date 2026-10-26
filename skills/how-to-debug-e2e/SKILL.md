---
name: how-to-debug-e2e
description: Use when debugging client, server, or end-to-end behavior locally with Playwright and/or a mirrored staging backend.
user-invocable: true
allowed-tools: Read, Glob, Bash, AskUserQuestion, Skill
compatibility: Client debugging requires Playwright or system Chrome; server debugging requires a traffic-mirroring tool (for example mirrord) and kubectl access to staging.
---

# Debug Locally

Choose the smallest feedback loop that can answer the question. Do not start a mirror
for a client-only problem or open a browser for a server-only problem.

A **mirror** runs your local backend code inside the staging cluster's network: it
steals or copies the traffic of one deployed service, so real requests hit your code.

## Choose a mode

- **Client**: use Playwright to reproduce UI behavior, inspect console/network events,
  or verify local frontend changes against the deployed backend.
- **Server**: use the mirror, curl, and logs to verify an endpoint or backend code
  path without a browser.
- **End to end**: combine both when the behavior depends on local client and server code,
  or when the failing layer is unknown.

Mirror work always targets **staging**, never production. Specs create real data.

Infer required inputs from the conversation and code; ask only for unresolved details:
the success criteria, relevant service or frontend, page or endpoint, shared staging
test account and user IDs, and feature flags. Never use the user's personal staging
account for browser debugging.

If the repo has its own start, login, or mirror skill, use it as the source of truth
instead of the generic steps below.

## Client loop: Playwright

1. If testing local frontend changes, start the frontend with its repo-specific skill
   or start script. Wait for the bundle URL; a running process does not mean the bundler
   finished compiling.
2. Reuse an existing session/login helper, such as a saved `storageState.json`.
3. Drive the real page with Playwright. Inspect console and network events as well as
   visible state; empty streams and silently swapped bundles may not show UI errors.
4. When loading a local bundle into a deployed page, launch Chrome with
   **`--disable-web-security`**. Otherwise private-network checks may silently fall back
   to the deployed bundle.

If Playwright browser binaries are unavailable, launch with `channel: 'chrome'` to use
system Chrome.

## Server loop: mirror, curl, and logs

Check the listeners first; reuse only a verified healthy mirror. If you have a worker id, add it to every `/tmp` file name, and never kill a process you did not start: report it.
Without one, show the listener and ask before you kill it.

A mirror usually uses fixed ports, so one mirror runs on the machine at a time. If you have a master, hold its mirror lock while your mirror runs, and reuse only a mirror you started. While you hold the lock, if another listener holds the mirror's port, send its PID to the master and wait for its answer; never stop it yourself.

```bash
lsof -nP -iTCP -sTCP:LISTEN
```

Record the PID of every process you start (`cmd > /tmp/<name>.log 2>&1 & echo $! > /tmp/<name>.pid`).

1. Start the mirror for the service under test. If the branch adds migrations, give the
   mirror its own database branch or apply them first: shared staging lacks the new
   columns and the first write fails.
2. Wait for the service's health endpoint to return `200`; startup can take several
   minutes. **Confirm the listening PID is the one you started, or its child** — a `200`
   from a stale orphan reads as healthy while your own boot is still in progress.
3. Call the endpoint directly with curl. If it needs a browser session, drive it from the
   browser with the routing header your mirror filters on.

Inspect backend logs and add tagged logs around silent code paths when needed.

## End-to-end loop

1. Run the server loop and verify the backend directly before adding the browser.
2. Run the client loop.
3. Inject the mirror's routing header **per URL** with `page.route(...)` so browser
   requests reach the mirror. Do not use a global header: it breaks third-party CDN
   preflights. Without the header, requests reach the deployed pod and may return
   misleadingly valid but empty or stale data.
4. Change one thing, rerun only the affected check, and repeat.
5. **Restart the mirror after every server code edit.** A file-watcher reboot may not
   re-register the traffic steal, and nothing fails loudly — the local process just stops
   logging. Use the cleanup block below, restart, and re-poll the health endpoint.

## Prove it worked

A captured client request does not prove the server parsed it. Confirm both:

- **Client**: the outgoing request body.
- **Server**: a log line from inside the code path under test, from that run.

If logs are sanitized and omit field values, add a temporary tagged log such as
`logger.info({ value }, 'TEMP_DEBUG ...')` to see a literal one. Remove it and check
`git status` before finishing.

## Clean up

Stop only the processes started for this investigation:

```bash
kill $(cat /tmp/<name>.pid)
lsof -nP -iTCP:<mirror-port>   # confirm nothing lingers
```

A leftover that is not yours stays.

## Troubleshooting

- **UI is missing**: confirm the feature flag for the test account in that
  environment; flag state differs between staging and production.
- **Local edits do not appear**: check `--disable-web-security`; the browser may be
  using the deployed bundle.
- **Data is empty or stale in e2e mode**: verify the per-URL routing header; the request
  may have reached the deployed pod.
- **Proxy call returns a misleading `200`**: inspect the upstream status and the body.
- **Mirror port refuses connections**: recheck health; restart the mirror if needed.
- **`Failed to fetch dynamically imported module`**: Vite returned `504 Outdated Optimize
  Dep`. Restart the dev server after any workspace package rebuild.
- **Account is inaccessible**: verify that you use a shared test account.
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
- **Logs may be sanitized.** A value missing from the logs was not necessarily missing
  from the request.
- **Wrong Node version fails late or silently.** Use the service's `.nvmrc`. mirrord runs
  the app under `sh -c`, which skips a lazy nvm shim and falls back to the default Node,
  so export the absolute bin dir on `PATH` yourself.
- **`playwright test --list` wrappers can swallow errors.** A wrapper that reports
  `0 tests` and no error may hide stderr. Run `playwright test --list` directly to see it.
- **You may be reading the wrong checkout.** With a worktree in play, print the absolute
  path beside any code fact you report; the main checkout is the wrong tree.
- **Pre-flight checks that look hung may be macOS sleep.** Compare `ps -o etime -p <pid>`
  with the wall clock, and launch under `caffeinate -i`.
- **Your own capture logic can be the bug.** If an assertion sees no request that
  demonstrably happened, check the trace or server log before blaming the feature.
