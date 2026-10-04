# Technical Specification — Issue #5

> **Status note:** Issue #5 is **CLOSED**. Commit `78487cb` on `main` ("fix: show terms and privacy tooltips on footer link hover (#7)", which says `Closes #5`) already fixes it. This spec documents the root cause and fix, and lists the verification work still outstanding.

## 1. Issue Overview

| Field | Value |
|---|---|
| Title | Inside the footer, when hover onto the "Privacy Policy" nothing being displayed |
| Description | Hovering the footer "Privacy Policy" link shows nothing. It should show some text about the Privacy Policy. |
| Labels | None |
| Milestone | None |
| Comments | None |
| State | Closed (fixed via PR #7) |
| Priority | Low (UX polish, no functional breakage) |

## 2. Problem Analysis

- In the initial commit (`8db35c5`), `src/components/Footer.jsx` rendered "Privacy Policy" as an `<a>` with **no `href` and no handler**. The only hover effect was a text-colour change and a gradient highlight, so no content appeared.
- Because the `<a>` had no `href`, it also could not receive keyboard focus, so it was neither focusable nor descriptive.
- No `/privacy` route exists in `src/App.jsx`, so the issue asks for inline hover text, not navigation to a page.
- **Root cause:** a placeholder link with nothing attached. The shared `Tooltip` component (`src/components/Tooltip.jsx`, introduced in `fa600f8` for the Cookie Policy fix, #4) was not applied to it.

## 3. Proposed Solution (as implemented)

- Replace the href-less `<a>` with `<button type="button">` so it is focusable and semantically correct for a non-navigating control.
- Wrap it in `<Tooltip>`:
  - `title="Privacy Policy"`
  - `content="We only collect the information you provide, like your profile, applications, and job postings, and use it to connect job seekers with employers. We never sell your personal data."`
- Add `focus:text-white` so keyboard focus looks the same as hover.
- `Tooltip` already handles hover (`group-hover/tooltip`), focus (`group-focus-within/tooltip`) and accessibility (`role="tooltip"`, `aria-describedby` on the child).
- The same commit applied the same treatment to "Terms of Service", which is consistent with the Cookie Policy fix.
- **Trade-off:** a short inline summary instead of a full privacy page. This is minimal and matches the issue's request. A dedicated page is out of scope.

## 4. Step-by-Step Implementation

1. **Convert the anchor to a button**: done in `78487cb`. The href-less `<a>` became `<button type="button">`.
2. **Wrap in Tooltip**: done. `Footer.jsx` ~lines 145–156.
3. **Focus styling**: done. `focus:text-white` was added.
4. **Lint**: outstanding. Run `npm run lint` to confirm it is clean.
5. **Manual verification**: outstanding (see §5).

## 5. Verification Strategy

### Unit Tests
- The repo has no test runner (no `test` script, no Vitest or Jest), so no unit tests are added.
- If test infrastructure is added later: render `Footer` → the "Privacy Policy" button's `aria-describedby` resolves to a `role="tooltip"` element that contains the privacy text.

### Integration Tests
- N/A (no test harness).

### Manual Checks
- Hover "Privacy Policy" → the tooltip appears above it with the title and the privacy summary.
- Tab to "Privacy Policy" → the button receives focus, the tooltip appears, and the text turns white.
- Click "Privacy Policy" → nothing happens: no navigation, no page jump to `#`, no console error.
- Hover Terms, Cookie and Contact Us → their tooltips still work (no regression).
- Mobile width (~375px) → the tooltip is readable and does not cause horizontal scroll.
- Light and dark theme → readable in both. The tooltip uses fixed dark styling, like the sibling tooltips.

## 6. Files to Modify

| File Path | Nature of Change |
|---|---|
| `src/components/Footer.jsx` | Already changed: Privacy Policy `<a>` → `<button>` wrapped in `Tooltip` |

## 7. New Files to Create

| File Path | Purpose |
|---|---|
| — | None required |

## 8. Existing Utilities to Leverage

| Utility | Benefit |
|---|---|
| `src/components/Tooltip.jsx` | Shared, accessible hover/focus tooltip already used by all footer legal links |

## 9. Acceptance Criteria

- [x] Hovering "Privacy Policy" in the footer shows descriptive privacy text
- [x] The tooltip appears on keyboard focus as well
- [x] Matches the existing footer tooltip pattern
- [ ] `npm run lint` passes (not yet verified)
- [ ] Manual checks in §5 pass with no regressions (not yet verified)
- Tests added: N/A (no test infrastructure in repo)

## 10. Out of Scope

- A dedicated `/privacy` page or route
- Legal review of the privacy wording
- Adding a test framework
- Converting `Footer.jsx` indentation from spaces to tabs (per `CLAUDE.md`; a separate `style/` change)
- Making `Tooltip` theme-aware through `ThemeContext`
