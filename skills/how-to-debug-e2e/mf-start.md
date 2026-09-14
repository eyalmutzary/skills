# Start Microfrontend Dev Server

Start Trident/Vite for any `mf-*`, including worktree symlink quirks.

## 1. Resolve `$MF_NAME`, `$PORT`, cwd

- **`$MF_NAME`**: from the ask → else cwd/`package.json` `"name": "mf-..."` → else ask.
- **`$PORT`**: from that MF's `.tridentrc.js`. Never hardcode.
- **cwd**: must be `microfrontends/$MF_NAME` (current dir if `package.json` name matches, else find under repo root).
- **log**: `/tmp/${MF_NAME}-start.log`

## 2. Worktree `node_modules` (only if path contains `.claude/worktrees/`)

Main repo root = current path with `.claude/worktrees/<name>/` stripped. Need both:

1. `./node_modules` → `<main>/microfrontends/$MF_NAME/node_modules`
2. `../../node_modules` → `<main>/node_modules` (Trident binary lives here — root symlink is required)

If either is missing/broken, report and suggest the `ln -s` commands. **Do not create symlinks yourself** — a wrong absolute path silently breaks all `trident` commands.

## 3. Clear port, start, poll until compiled

Run as **one** foreground bash command (timeout up to ~5 min / 300s). Poll the **bundle** URL, not `/` — Vite compiles lazily on first request; the Trident banner alone ≠ ready.

```bash
lsof -ti :$PORT | xargs kill -9 2>/dev/null; sleep 1
yarn start > /tmp/${MF_NAME}-start.log 2>&1 &
PID=$!
for i in $(seq 1 60); do
  kill -0 $PID 2>/dev/null || { echo "yarn start died — check node_modules symlinks"; break; }
  sleep 5
  RESPONSE=$(curl -sk -o /dev/null -w "%{http_code}" https://webpack.llama.fan:$PORT/build/wrapper.output.js 2>/dev/null)
  [ "$RESPONSE" = "200" ] && { echo "READY after ~$((i*5))s"; break; }
done
```

(If this MF documents a different ready URL than `/build/wrapper.output.js`, use that.)

## 4. Report

- **200**: `Dev server is up at https://webpack.llama.fan:$PORT` — open monday.com; local bundle injects automatically.
- **timeout**: fail + last 20 lines of `/tmp/${MF_NAME}-start.log`.

## Gotchas

- Hostname is `webpack.llama.fan` but Trident uses **Vite** — no webpack progress output.
- Vite logging is silent by default; set `vite: { logLevel: 'error' }` in `.tridentrc.js` (trident-toolkit ≥2.10.27) or open the bundle URL in a browser to see compile errors.
