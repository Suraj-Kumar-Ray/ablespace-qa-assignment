# AbleSpace (staging.ablespace.io) — Test Scenarios

**Tester:** QA Tester (assignment account, `csesuraj2003@gmail.com`)
**Role selected at signup:** Special Education Teacher
**Build under test:** `staging.ablespace.io` (registration + onboarding + Caseload + Data Capture + Calendar)
**Date executed:** 15 Oct 2026
**Browser used for execution:** Chromium (desktop) at 658×771 CSS px (equivalent to ~820×894 @ 1.25 DPR), plus 375×667 and 768×1024 for responsive checks

Legend — **Status:** `Pass` = behaved as expected · `Fail` = defect found (linked to a bug ID) · `Blocked` = could not be completed in this environment

| ID | Scenario | Area | What it verifies | Status |
|----|----------|------|------------------|--------|
| SC-01 | New account signup + onboarding | Auth / Onboarding | A new therapist can register with a work email, pick a role, set a password, accept the policy, then choose solo/team and the feature set to get a working workspace | **Fail** (BUG-03, BUG-04) |
| SC-02 | Caseload search and empty state | Caseload | Searching filters the student list by name and a no-match search shows a usable empty state with a way back | **Pass** |
| SC-03 | Caseload column filters | Caseload | The filter panel (Full Name, Last Name, IEP Due, Eval Due, Collaborators, Service Time, School, Site, Grade, DOB, Teacher…) opens with correct controls, counts and Apply/Clear all/Discard actions | **Pass** |
| SC-04 | Create a student manually — field validation | Caseload / Data integrity | Required fields are enforced and impossible data (e.g. a date of birth in the future) is rejected before a record is written | **Fail** (BUG-02) |
| SC-05 | Caseload grid readability at different widths | Caseload (responsive) | Every column value stays fully readable (or is shortened with an ellipsis/tooltip) at phone, tablet and desktop widths | **Fail** (BUG-05) |
| SC-06 | Start a data-collection session for a student | Data Capture | "Take Data" opens a session for the correct student with the right date/time window, and the student is attached to the event | **Pass** |
| SC-07 | Trial counter boundaries | Data Capture | The trial counter accepts only plausible values (digits only, sane upper bound) and never records a negative or absurd trial count | **Pass** |
| SC-08 | Edit an event's time window | Data Capture / Calendar | The event editor rejects an end time that is not after the start time and keeps the user in the editor | **Pass** |
| SC-09 | Session persistence — refresh / reopen a session | Data Capture (critical path) | Refreshing the browser, or reopening a session URL, keeps the therapist inside the same data-collection session | **Fail** (BUG-01) |
| SC-10 | Email-verification reminder and resend throttle | Auth / Notifications | The reminder banner explains the state, resend actually sends, and repeat clicks are rate-limited with a visible countdown | **Pass** |

## Coverage notes

- The **critical path** is SC-09 → SC-06 → SC-07: a therapist starts a session, records trials and expects the work to survive a stray refresh. Two of those three are sound; the refresh/persistence step is not (BUG-01), which is why it carries the highest severity.
- **Guard rails that already exist and were confirmed working:** trial counter rejects negative/garbage input (SC-07), event editor rejects end-before-start (SC-08), search has a proper no-match empty state (SC-02), resend-verification is throttled with a countdown (SC-10). These are worth keeping — several of them are exactly the guards the failing scenarios are missing.
- **Not covered in this pass (honest gaps):** Billing (Pro-gated, not consented to), Groups (Pro paywall), AI/IEP-upload flows, Service-Time logging, Accommodations, guardian/collaborator invites, multi-user permission boundaries, and CSP/security headers. Each is named in `05-summary.md` under "Not tested".
