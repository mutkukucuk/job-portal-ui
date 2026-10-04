#!/usr/bin/env bash
# PreToolUse hook (chrome-devtools MCP): only lets the browser open local URLs.
#
# Keeps Claude on the local dev server so it can't browse to external sites
# and pull untrusted page content into the session.
#
# Exit codes:
#   0 -> allowed
#   2 -> blocked (stderr message is fed back to Claude)
set -euo pipefail

if ! command -v jq >/dev/null 2>&1; then
	echo "protect-browser: jq is required but not installed; blocking to fail safe." >&2
	exit 2
fi

URL=$(jq -r '.tool_input.url // empty')
# navigate_page also supports back/forward/reload without a url.
[[ -z "$URL" ]] && exit 0

if [[ "$URL" =~ ^https?://(localhost|127\.0\.0\.1|\[::1\])(:[0-9]+)?(/|\?|#|$) ]]; then
	exit 0
fi

if [[ "$URL" == "about:blank" ]]; then
	exit 0
fi

echo "Blocked: browser may only open localhost URLs, got '$URL'. Ask the user first." >&2
exit 2
