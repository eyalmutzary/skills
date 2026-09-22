# Running curtain specs

`curtain` is monday's Playwright wrapper. These details are not in `--help`.

## Invoke the binary directly

`npx curtain` resolves against the sub-package's scripts and fails with
`Missing script: curtain`. The CLI lives in the repo-root `node_modules`:

```bash
../../node_modules/.bin/curtain --project=staging --grep="<test name>"
```

Add `--headed` to watch it.

## Always pass `--project=staging`

Projects are `local`, `ci`, `staging`, `production`. Pass `staging` explicitly every run:
a repo's `e2e/curtain.config.js` may set `IsProduction: true`, so omitting the flag can
send a data-creating spec at a real production account.

## Scope with `--grep`, never a file path

There is no positional path filter. A path prints `[Invalid argument]: <path>` and then
runs every spec anyway, which looks like a hang.

## Clear cached auth when switching project

`e2e/.auth` and `e2e/.scenario-dictionary` cache credentials per environment. Reusing
them across projects gives `401 NOT_AUTHENTICATED` on the first API call.

```bash
rm -rf e2e/.auth e2e/.scenario-dictionary
```

## Other traps

- **Flags differ per environment.** The same account slug can have a flag off in
  production and on in staging. Missing UI is a flag check, not a code hunt.
- **Fresh fixtures start empty.** `createWorkflow` gives a bare canvas, so page objects
  expecting a configured node need an arrangement step first, such as
  `Editor.selectTriggerBlock('When item created', 'boardId')`. Copy a neighbouring spec.
- **Recover a request body from a trace** when an in-test `page.route` capture misses it:

  ```bash
  unzip -o e2e/test-results/<run-dir>/trace.zip -d /tmp/trace-extract
  grep -rao '"<fieldName>[^}]*}' /tmp/trace-extract/resources/
  ```
