# AbleSpace staging — QA Summary (half page)

**Scope tested:** registration, onboarding (solo/team + feature picker), caseload (search, filters, add student, grid views, empty states), data-capture session (goal selection, trial counter, undo, notes, event editing), calendar, and the email-verification banner. Tested on 15 Oct 2026 against `staging.ablespace.io` in Chromium on Windows 11, at 375 px, 768 px and desktop widths, with a freshly created *Special Education Teacher* account.

**Verdict:** the build's guard rails are good where they exist, but there is one critical-path defect and two clinical-data defects that I would not release without fixing.

| | |
|---|---|
| **Scenarios designed / executed** | 10 / 10 |
| **Test cases executed** | 8 — 4 pass, 4 fail |
| **Defects raised** | 5 (1 High, 3 Medium, 1 Low) |

**Blocking issue (P1):** refreshing the browser, or reopening a `/session/<id>` link, throws the therapist out of a live data-collection session and dumps them on the Calendar (BUG-01, reproduced 2/2, with two "You do not have permissions to perform this action" toasts on one attempt). For a product where a therapist captures trials in front of a student, one accidental refresh ending the session — silently, with no way back — is the highest-impact thing I found, and the misleading permission error would send it straight to support.

**Data-integrity issues (P2):** a student can be created with a date of birth of **12/31/2030** and no warning (BUG-02), and at tablet width the caseload grid shows Eval Due dates clipped to `03/25/20` / `02/28/20` with no ellipsis or tooltip (BUG-05). Both feed compliance reporting; a wrong year that *looks* like real data is worse than a blank cell.

**Front-door and polish:** the first signup submit showed the raw SDK string `Firebase: Error (auth/invalid-recaptcha-token)` and only an identical second click worked (BUG-03), and the `+ Add Student` chooser is titled "Bulk Add Students" (BUG-04).

**What works well:** search has a proper no-match empty state with a Clear-filters route; the trial counter rejected negative and absurd input; the event editor correctly blocked end-before-start with a clear inline message and a "Discard Unsaved Changes?" confirm; resend-verification is throttled with a visible countdown; and at 375 px the grid collapses without clipping. The correct patterns already exist in this codebase — most of my findings are the same patterns not yet applied everywhere.

**Not tested (honest gaps):** Firefox/WebKit (no engine available — see the matrix), touch keyboards, screen readers and keyboard-only navigation, slow/offline networks, and all Pro-gated areas (Billing, Groups, advanced scheduling). No security or performance testing was performed, and nothing blocked was recorded as a pass.
