# Technical Specification — Issue #9

> **Status note:** Issue #9 is **CLOSED**. The fix has already been merged to `main` in commit `88bd99f` ("fix: show help tooltip on footer contact us link (#10)"). This spec documents the root cause and fix, and lists the verification work still outstanding: the bot comment says lint and the app were never run.

## 1. Issue Overview

| Field | Value |
|---|---|
| Title | Inside the footer, when user hovers on "Contact Us" not text being displayed |
| Description | Hovering the footer "Contact Us" link shows no help text. The link goes to the Contact page, where users can message the admin about a problem. Help text should appear on hover. |
| Labels | None |
| Milestone | None |
| State | Closed (fixed via PR #10) |
| Priority | Low (UX polish, no functional breakage) |

## 2. Problem Analysis

- `src/components/Footer.jsx` renders a bottom row of legal and help links: Privacy Policy, Terms of Service, Cookie Policy and Contact Us.
- Earlier fixes (#4, #7) wrapped Privacy, Terms and Cookie in the shared `Tooltip` component (`src/components/Tooltip.jsx`). "Contact Us" stayed a bare `<Link to="/contact">`, so nothing appeared on hover.
- **Root cause:** the `Tooltip` wrapper was missing on the Contact Us link. It was an inconsistency, not a bug in `Tooltip` itself.
- The route `/contact` → `Contact` page exists (`src/App.jsx:137`). Admins read messages at `admin/contact-messages` (`src/App.jsx:124`), which matches the issue's "message can be sent to admin" description.

## 3. Proposed Solution (as implemented)

- Wrap the existing Contact Us `<Link>` in `<Tooltip>`, the same way the three neighbouring links are wrapped:
  - `title="Contact Us"`
  - `content="Facing a problem or have a question? Click to open the contact page and send a message to our admin team."`
- Add `focus:text-white` to the link's classes, matching the sibling links, so keyboard users get the same visual state.
- `Tooltip` already supports hover (`group-hover/tooltip`) and keyboard focus (`group-focus-within/tooltip`), and it sets `aria-describedby` on the child. The link becomes accessible with no new code.
- **Trade-off:** none. This reuses an existing component and adds no new patterns.

## 4. Step-by-Step Implementation

1. **Wrap the link**: done in `88bd99f`. `Footer.jsx` lines ~181–192 now wrap the Contact Us `Link` in `Tooltip`.
2. **Align focus styling**: done. `focus:text-white` was added to the link's classes.
3. **Run lint**: outstanding. Run `npm run lint`; the bot could not run ESLint in CI.
4. **Visual check in the app**: outstanding. Run `npm run dev` and check the tooltip in light and dark mode and at mobile width (see §5).
5. **Optional follow-up: indentation**: `CLAUDE.md` requires tabs, but `Footer.jsx` and `Tooltip.jsx` use spaces. Leave this alone unless a separate `style/` change is wanted (see §10).

## 5. Verification Strategy

### Unit Tests
- The repo has no test runner (no `test` script, no Vitest or Jest in `package.json`), so no unit tests are added. Adding test infrastructure would be out of proportion for this issue.
- If test infrastructure is added later: render `Footer` → the "Contact Us" link has an `aria-describedby` that points to a `role="tooltip"` element with the help text.

### Integration Tests
- N/A (no test harness). If one is added later: clicking Contact Us → navigates to `/contact` and renders the `Contact` page.

### Manual Checks
- Hover "Contact Us" in the footer → the tooltip fades in above the link with the title "Contact Us" and the help text.
- Tab to "Contact Us" with the keyboard → the tooltip appears (focus-within), and the link text turns white.
- Click "Contact Us" → navigates to `/contact`. The tooltip does not block the click (`pointer-events-none`).
- Hover Privacy, Terms and Cookie → their tooltips still work (no regression).
- Mobile width (~375px) → the tooltip (`max-w-[16rem]`, centered) is not clipped badly at the viewport edge, and there is no horizontal scroll.
- Light and dark theme → the tooltip is readable in both. Note that it uses fixed dark styling, like the sibling tooltips.

## 6. Files to Modify

| File Path | Nature of Change |
|---|---|
| `src/components/Footer.jsx` | Already changed: Contact Us link wrapped in `Tooltip`, `focus:text-white` added |

## 7. New Files to Create

| File Path | Purpose |
|---|---|
| — | None required |

## 8. Existing Utilities to Leverage

| Utility | Benefit |
|---|---|
| `src/components/Tooltip.jsx` | Shared, accessible hover/focus tooltip (`aria-describedby`, `role="tooltip"`), already used by the sibling footer links |
| React Router `Link` | Existing navigation to `/contact`; unchanged |

## 9. Acceptance Criteria

- [x] Hovering "Contact Us" in the footer shows help text explaining that it opens the contact page to message the admin
- [x] The tooltip also appears on keyboard focus
- [x] Implementation matches the existing Privacy/Terms/Cookie tooltip pattern
- [ ] `npm run lint` passes (not yet verified)
- [ ] Manual checks in §5 pass with no regressions to the other footer tooltips (not yet verified)
- Tests added: N/A (no test infrastructure in repo)

## 10. Out of Scope

- Adding a test framework (Vitest or React Testing Library)
- Changing indentation from spaces to tabs in `Footer.jsx` or `Tooltip.jsx` (a separate `style/` change if wanted)
- Making `Tooltip` theme-aware through `ThemeContext`
- Changes to the `Contact` page or the admin contact-messages flow
- Tooltips on other footer columns (quick links, social icons)
