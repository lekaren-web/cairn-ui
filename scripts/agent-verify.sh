#!/usr/bin/env bash
# Claude Code "Stop" hook: an agent can't end its turn with a broken library.
# If files changed and `npm run verify` fails, exit 2 so the failure goes back to the agent to fix.
# It blocks once per stop; if the agent tries to stop again it's let through, so a stuck fix
# can't loop forever.
set -uo pipefail
cd "$(dirname "$0")/.."

input=$(cat)
if printf '%s' "$input" | grep -q '"stop_hook_active": *true'; then exit 0; fi

# Nothing changed since the last commit: nothing to check.
if git diff --quiet HEAD -- && [ -z "$(git ls-files --others --exclude-standard)" ]; then exit 0; fi

if ! output=$(npm run --silent verify 2>&1); then
  {
    echo "npm run verify failed. Fix this before finishing (see AGENTS.md, Definition of done):"
    printf '%s\n' "$output" | tail -40
  } >&2
  exit 2
fi
exit 0
