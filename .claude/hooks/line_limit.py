#!/usr/bin/env python3
"""
PreToolUse hook — blocks Write/Edit calls that would result in a file exceeding 500 lines.

Exit codes:
  0 → allowed
  2 → blocked (stderr message fed back to Claude)
"""

import json
import sys

LINE_LIMIT = 500


def read_current(filepath):
    """Return the file's current content, or None if it is missing/unreadable."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    except (OSError, UnicodeDecodeError):
        return None


def get_resulting_content(tool_name, tool_input):
    """Return (filepath, content_after, content_before); content_after None means skip."""
    filepath = tool_input.get("file_path", "")
    before = read_current(filepath) if filepath else None

    if tool_name == "Write":
        return filepath, tool_input.get("content", ""), before

    if tool_name == "Edit":
        if before is None:
            return filepath, None, None  # file unreadable — skip
        old_string = tool_input.get("old_string", "")
        new_string = tool_input.get("new_string", "")
        count = -1 if tool_input.get("replace_all") else 1
        return filepath, before.replace(old_string, new_string, count), before

    return "", None, None


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    tool_name = data.get("tool_name", "")
    if tool_name not in ("Write", "Edit"):
        sys.exit(0)

    filepath, content, before = get_resulting_content(tool_name, data.get("tool_input", {}))
    if not content:
        sys.exit(0)

    lines = len(content.splitlines())
    lines_before = len(before.splitlines()) if before else 0
    # Allow edits that keep or shrink an already-oversized file.
    if lines > LINE_LIMIT and lines > lines_before:
        print(
            f"Blocked: '{filepath}' would be {lines} lines (limit: {LINE_LIMIT}).\n"
            f"Split it into smaller, focused modules before writing.",
            file=sys.stderr,
        )
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()