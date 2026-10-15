# AbleSpace QA assignment — deliverables

Manual + automated test pass on the **AbleSpace** staging web app, plus the optional Playwright bonus.
Executed **15 Oct 2026** against `https://staging.ablespace.io` in Chromium on Windows 11.

| Section | Deliverable |
|---|---|
| Test scenarios (8–10) | [`01-test-scenarios.md`](01-test-scenarios.md) — 10 scenarios |
| Test cases (5–8, executed) | [`02-test-cases.md`](02-test-cases.md) — 8 cases, 4 pass / 4 fail |
| Bug reports (3+, with evidence) | [`03-bug-reports.md`](03-bug-reports.md) — 5 defects, 1 High / 3 Medium / 1 Low |
| Cross-browser & responsive matrix | [`04-compatibility-matrix.md`](04-compatibility-matrix.md) |
| Half-page summary | [`05-summary.md`](05-summary.md) |
| Bonus — Playwright | [`06-playwright-bonus.md`](06-playwright-bonus.md) + the runnable suite in [`playwright/`](playwright/README.md) |
| Evidence | [`evidence/`](evidence/) — screenshots written by the executed automation |

## Headline findings

1. **BUG-01 (High)** — refreshing the browser, or reopening a `/session/<id>` link, throws the therapist out of a live data-capture session and drops them on the Calendar (`/calendar`), with no message and no way back; reproduced 2/2, and one attempt showed two *"You do not have permissions to perform this action"* toasts.
2. **BUG-02 (Medium)** — a student can be created with a date of birth of **12/31/2030** and no warning.
3. **BUG-05 (Medium)** — at tablet width (768 px) the caseload grid silently truncates Eval Due dates to `03/25/20` / `02/28/20` with no ellipsis or tooltip.
4. **BUG-03 (Medium)** — the first signup submit shows the raw SDK string `Firebase: Error (auth/invalid-recaptcha-token)`; only an identical second click works. Same root cause blocks automated sign-in (`CAPTCHA_CHECK_FAILED`).
5. **BUG-04 (Low)** — the `+ Add Student` chooser is titled "Bulk Add Students".

## Test account & data created

- Account: `csesuraj2003@gmail.com` (display name *QA Tester*), role *Special Education Teacher*, onboarding "On my own" with Track Data / Service Time / Accommodations / IEP Creation enabled. E-mail verification was **not** completed, so the in-app verification banner is visible throughout the evidence.
- Records created on staging during testing: one student **Test Student** (DOB 12/31/2030), and several *New Session* events on the 15 Oct calendar. Two demo students were left untouched.

## Reading the results honestly

- Every "Pass" in these files was executed and observed; every failure lists the exact steps and the value or URL that proved it.
- Two areas are reported as **not executed** rather than as passes: Firefox/WebKit engines (not available in this environment) and the authenticated Playwright specs (blocked by the app's reCAPTCHA-gated sign-in — see `06-playwright-bonus.md`).
- Pro-gated areas (Billing, Groups, advanced scheduling) were not tested, and no security, accessibility or performance testing was performed; the compatibility matrix lists those gaps explicitly.
