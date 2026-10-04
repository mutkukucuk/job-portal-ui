#!/usr/bin/env bash
# PreToolUse hook (Bash): blocks shell commands that would modify protected files.
#
# File-edit hooks only see Write/Edit calls, so package managers rewriting
# package-lock.json (npm install/update/...) bypass them. This closes that gap.
# Heuristic only: for hard enforcement also use permissions.deny or chmod a-w.
#
# Exit codes:
#   0 -> allowed
#   2 -> blocked (stderr message is fed back to Claude)
set -euo pipefail

if ! command -v jq >/dev/null 2>&1; then
	echo "protect-bash: jq is required but not installed; blocking to fail safe." >&2
	exit 2
fi

COMMAND=$(jq -r '.tool_input.command // empty')
[[ -z "$COMMAND" ]] && exit 0

SEP='(^|[;&|[:space:]])'
PKG_MUTATION="${SEP}(npm|pnpm|yarn)[[:space:]]+(install|i|add|update|up|upgrade|uninstall|remove|rm|ci|dedupe|audit[[:space:]]+fix)([[:space:]]|\$)"
PROTECTED='(package-lock\.json|(^|[/[:space:]])\.env([.][A-Za-z0-9_-]+)?([[:space:]]|$)|\.claude/hooks/|\.claude/settings(\.local)?\.json|\.mcp\.json)'
WRITE_OPS="(>|${SEP}(tee|rm|mv|cp|truncate)[[:space:]]|sed[[:space:]]+-[A-Za-z]*i)"

if grep -Eq "$PKG_MUTATION" <<<"$COMMAND"; then
	echo "Blocked: package manager command would rewrite package-lock.json. Ask the user first." >&2
	exit 2
fi

if grep -Eq "$PROTECTED" <<<"$COMMAND" && grep -Eq "$WRITE_OPS" <<<"$COMMAND"; then
	echo "Blocked: command appears to modify a protected file (package-lock.json / .env / claude config). Ask the user first." >&2
	exit 2
fi

exit 0
