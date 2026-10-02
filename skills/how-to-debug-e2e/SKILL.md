---
name: how-to-debug-e2e
description: Use when debugging client, server, or end-to-end behavior locally with Playwright and/or a locally running backend.
user-invocable: true
allowed-tools: Read, Glob, Bash, AskUserQuestion, Skill
compatibility: Client debugging requires Playwright or system Chrome. Server debugging requires the service running locally.
---

# Debug Locally

Choose the smallest feedback loop that can answer the question. Do not start a backend
for a client-only problem or open a browser for a server-only problem.

## Choose a mode

- **Client**: use Playwright to reproduce UI behavior, inspect console/network events,
  or verify local frontend changes against the running backend.
- **Server**: use curl and logs to verify an endpoint or backend code path without a browser.
- **End to end**: combine both when the behavior depends on local client and server code,
  or when the failing layer is unknown.

Infer required inputs from the conversation and code; ask only for unresolved details:
the success criteria, relevant service or frontend, and the page or endpoint.

Prefer a repo-specific start or test skill when the project has one. Otherwise follow
the loops below.

## Workspace pre-flight

A fresh git worktree has no `node_modules` and no built package output. Reuse the
primed checkout when you can. In a new one, install dependencies and build workspace
packages before any other command. A backgrounded install can fail silently; run it
in the foreground and check the exit code.

`Cannot find module '.../dist/index.js'` means this gate did not finish. Rerun it.

## Client loop: Playwright

1. If testing local frontend changes, start the dev server the repo documents. Wait
   until the bundle or page URL responds; a running process does not mean compilation
   finished.
2. Reuse an existing session or login helper when the repo has one.
3. Drive the real page with Playwright. Inspect console and network events as well as
   visible state; empty responses and a silently swapped bundle may not show UI errors.
4. When the page loads a bundle from another local origin, launch Chrome with
   **`--disable-web-security`**. Otherwise the browser may silently fall back to the
   deployed bundle.

If Playwright browser binaries are unavailable, launch with `channel: 'chrome'` to use
system Chrome.

## Server loop: curl and logs

1. Start the backend the way the repo documents. If the branch under test adds
   migrations, apply them before the first write.
2. Wait until the service's health or liveness URL returns success. Confirm the
   listening PID is the process you started. A success response from a stale process
   reads as healthy while your own boot is still in progress.
3. Call the endpoint with curl. If a proxy returns success for upstream failures,
   check the upstream status and the response body.
4. Inspect backend logs and add tagged logs around silent code paths when needed.

## End-to-end loop

1. Run the server loop and verify the backend directly before adding the browser.
2. Run the client loop.
3. Confirm browser requests hit the local server, not a deployed environment. A
   deployed response can look valid while it is empty or stale.
4. Change one thing, rerun only the affected check, and repeat.
5. Restart the local server after a server code edit when the process does not
   reload itself cleanly.

## Prove it worked

A captured client request does not prove the server parsed it. Confirm both:

- **Client**: the outgoing request body.
- **Server**: a log line from inside the code path under test, from that run.

If logs omit field values, add a temporary tagged log such as
`logger.info({ value }, 'TEMP_DEBUG ...')` to see a literal one. Remove it and check
`git status` before finishing.

## Clean up

Stop only the processes started for this investigation. Confirm the port is free.

## Troubleshooting

- **UI is missing**: confirm the feature flag or config for the account you are using.
- **Local edits do not appear**: the browser may be using a deployed bundle. Check
  `--disable-web-security` and that the dev server finished compiling.
- **Data is empty or stale in e2e mode**: the request may have reached a deployed
  server instead of the local one.
- **A call returns a misleading success**: inspect the upstream status and the body.
- **The service port refuses connections**: recheck liveness and restart if needed.
- **`Failed to fetch dynamically imported module`**: the dev server returned an
  outdated dependency optimize response. Restart it after a workspace package rebuild.
- **No server logs for a request that happened**: the request did not hit the process
  you are watching.

## Gotchas

Silent failures that look like bugs in the code under test.

- **Logs may omit field values.** A value missing from the logs was not necessarily
  missing from the request.
- **Wrong Node version fails late or silently.** Use the version the repo pins.
- **You may be reading the wrong checkout.** With a worktree in play, print the absolute
  path beside any code fact you report.
- **Pre-flight checks that look hung may be macOS sleep.** Compare `ps -o etime -p <pid>`
  with the wall clock, and launch under `caffeinate -i`.
- **Your own capture logic can be the bug.** If an assertion sees no request that
  demonstrably happened, check the trace or server log before blaming the feature.
