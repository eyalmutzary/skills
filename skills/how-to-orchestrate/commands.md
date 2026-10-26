# Commands

Always write `command claude`: the user's `claude` is an alias. Run spawn commands from inside a worktree of an already trusted repo; the trust prompt cannot be scripted, so an untrusted folder is a human-only item.

## Install the kit

Hooks and settings run from `~/.claude/master/`, so they work for plugin and local installs. The master copies them on every start, from this skill's folder (`<skill dir>` = the folder of this file):

```bash
mkdir -p ~/.claude/master && cp -R <skill dir>/hooks <skill dir>/master-settings.json ~/.claude/master/
```

The first master start needs this copy by hand before the start command below.

## Per-worker files

Pick a name that is not in `command claude agents --json` and is not a prefix of another worker's name (`attach` matches part of a name; otherwise attach by short id). Create `~/.claude/master/workers/<name>/` and fill the templates into it:

- `worker-prompt.md` -> `prompt.md`, `worker-settings.json` -> `settings.json`.
- Placeholders: `{{NAME}}`, `{{MODE}}` (`afk|present`), `{{SLOT}}` (N), `{{PORTS}}` (`30N0-30N9`).
- The attach flag is the file `~/.claude/master/workers/<name>/attached`.

## Spawn

```bash
command claude --bg -n <name> --permission-mode bypassPermissions \
  --append-system-prompt-file ~/.claude/master/workers/<name>/prompt.md \
  --settings ~/.claude/master/workers/<name>/settings.json "<skill and order>"
```

Prints the short id. A folder that was never trusted fails with "Workspace not trusted".

## State, stop, remove

```bash
command claude agents --json | jq -r '.[] | "\(.name) \(.status) \(.state) \(.id)"'   # one line per worker; status busy|idle|waiting
command claude stop <id>
command claude rm <id>
```

`stop` and `rm` take the short id, not the name. `rm` keeps a worktree that the session did not create.

The transcript is `~/.claude/projects/<cwd-slug>/<sessionId>.jsonl`. `claude logs` prints raw escape codes.

## Hand-off split

Use `attach`, not `--resume` (refused while the worker runs). `--resume <name>` is only for a stopped worker.

```bash
osascript -e 'tell application "iTerm" to tell current session of current window
  set s to (split vertically with default profile)
  tell s to write text "command claude attach <name>"
  return id of s
end tell'
```

Save the printed id in the state file. To reuse the split, send text to it by id. Send with `newline NO`, wait 2 seconds, then send an empty line:

```bash
osascript - "<split-id>" "<text>" <<'OSA'
on run argv
  tell application "iTerm"
    repeat with w in windows
      repeat with t in tabs of w
        repeat with s in sessions of t
          if id of s is item 1 of argv then
            tell s to write text (item 2 of argv) newline NO
            delay 2
            tell s to write text ""
            return "sent"
          end if
        end repeat
      end repeat
    end repeat
  end tell
  return "SPLIT NOT FOUND"
end run
OSA
```

To read a split's screen, use `contents of s` in the same loop. To close it, `tell s to close`.

## Notify

```bash
osascript -e 'display notification "<worker>: <one line>" with title "master"'
```

## Watcher

Finish and idle events come from `SendMessage` with `notify_when_idle: true`, sent to each worker on spawn and after each message to it; renew within 12 hours. Everything else comes from the watcher, run with `run_in_background`:

```bash
<skill dir>/scripts/master-watch <worker name>... [--interval 60] [--stuck-minutes 30]
```

Stop the running watcher with `TaskStop` before you start one with a new list.

## Start the master

```bash
command claude -n master --permission-mode bypassPermissions --settings ~/.claude/master/master-settings.json "/how-to-orchestrate"
```

Restart after a crash or exit, by the full session id (`claude agents --json --all` shows it; the state file keeps it). A name makes a copy with a new id and a new name, and workers lose `master`:

- Interactive: `command claude --resume <sessionId> -n master --permission-mode bypassPermissions --settings ~/.claude/master/master-settings.json`.
- Background: `command claude --bg --resume <sessionId>`, with no other flags. It wakes with its saved name, mode, and settings; any flag makes a copy.

Before either, check that no live session is already named `master`.
