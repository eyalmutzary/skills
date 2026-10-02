#!/bin/sh
# Launch ccstatusline without a hardcoded username or Node path.
# Prefers PATH, then the nvm binary this machine already uses.

ccstatusline_from_path() {
  command -v ccstatusline
}

ccstatusline_from_nvm() {
  pinned="$HOME/.nvm/versions/node/v24.13.1/bin/ccstatusline"
  if [ -x "$pinned" ]; then
    printf '%s\n' "$pinned"
    return 0
  fi

  for bin in "$HOME"/.nvm/versions/node/*/bin/ccstatusline; do
    if [ -x "$bin" ]; then
      printf '%s\n' "$bin"
      return 0
    fi
  done

  return 1
}

binary="$(ccstatusline_from_path)" || binary="$(ccstatusline_from_nvm)" || {
  echo "ccstatusline not found. Install with: npm i -g ccstatusline" >&2
  exit 1
}

exec "$binary" "$@"
