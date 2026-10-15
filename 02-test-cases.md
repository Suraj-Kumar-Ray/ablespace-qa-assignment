# AbleSpace (staging.ablespace.io) — Executed Test Cases

All cases below were **executed by hand against the live staging build** on **15 Oct 2026** in Chromium. "Actual" describes what the application did, not what was assumed.

Account used: fresh account `csesuraj2003@gmail.com` (display name *QA Tester*), role *Special Education Teacher*, onboarding answer *On my own*, features *Track Data · Track Service Time · Track Accommodations · IEP Creation*.

---

## TC-01 — Signup with a real email, role and strong password
**Scenario:** SC-01 · **Priority:** High (entry point for every user)

| | |
|---|---|
| **Preconditions** | Signed out; `/signup` with the e-mail step already completed |
| **Steps** | 1. Enter full name `QA Tester`. 2. Pick role `Special Education Teacher` from the searchable Role field. 3. Enter a 21-character strong password (strength meter shows *Strong*). 4. Tick the Privacy-Policy acknowledgement. 5. Click **Continue**. |
| **Expected** | Account is created and the user lands on the onboarding question ("How will you be using AbleSpace?") |
| **Actual** | **First attempt failed:** a raw SDK string appeared at the bottom of the form — `Firebase: Error (auth/invalid-recaptcha-token)`. The form kept all values. Pressing **Continue** a second time, unchanged, succeeded and moved the user to `/onboarding`. |
| **Result** | **Fail** — see **BUG-03** (raw, unmapped error text; non-obvious retry) |
| **Evidence** | Error string captured from the DOM after submit; signup POST to `identitytoolkit.googleapis.com/v1/accounts:signUp` returned HTTP 400 on the first attempt only |

## TC-02 — Caseload search, including the no-match state
**Scenario:** SC-02 · **Priority:** Medium

| | |
|---|---|
| **Preconditions** | Signed in; Caseload → Students tab showing 3 students |
| **Steps** | 1. Type `zzzz` in **Search students…**. 2. Inspect the grid. 3. Clear the search (Ctrl+A, Delete). |
| **Expected** | Rows are filtered to matches; a no-match search shows an explanatory empty state; clearing restores the full list |
| **Actual** | Grid dropped to 0 rows and the overlay read *"No matching results found / Try adjusting your search or filter to find what you're looking for"* with a **Clear All Filters** action. Clearing the box restored all 3 rows. |
| **Result** | **Pass** |

## TC-03 — Add a student manually with an impossible date of birth
**Scenario:** SC-04 · **Priority:** High (data integrity for a clinical record)

| | |
|---|---|
| **Preconditions** | Signed in; Caseload → **Add Student** |
| **Steps** | 1. In the *Add Student* modal, enter First Name `Test`, Last Name `Student`. 2. Set **DOB** = `12/31/2030`. 3. Leave every other optional field empty. 4. Click **Create**. |
| **Expected** | The form rejects a future date of birth (a student cannot be born in the future) and keeps the user in the form |
| **Actual** | The student was **created** — toast *"Student created successfully"*, the header count went from `Students (2)` to `Students (3)`, and the new row `Test Student | Student | - | -` appeared in the grid with a DOB of 12/31/2030 stored. No warning, no inline error. |
| **Result** | **Fail** — see **BUG-02** |
| **Evidence** | DOM value of the DOB input before submit (`12/31/2030`), success toast, grid count 3 and the new row |

## TC-04 — Start a data-collection session with **Take Data**
**Scenario:** SC-06 · **Priority:** High (core workflow)

| | |
|---|---|
| **Preconditions** | Signed in; Caseload with a student that has a goal |
| **Steps** | 1. On the row for *Demo Student1*, click **Take Data**. 2. Wait for the session view. 3. Read the header, the goal banner and the capture controls. |
| **Expected** | A session opens for the clicked student, with the event window and the student's goal ready for trial entry |
| **Actual** | URL became `/session/<id>`; header showed `10/15/2026, 09:03 AM – 09:33 AM`, the student chip `DS`, a **Capture / Trial 1 / Phase** selector, and the goal text *"Social Studies — Demo Student1 will take 5 bites, from a handheld snack, such as a cheese stick, in 4 out of 5 opportunities."* Counter, Undo and Save were present. |
| **Result** | **Pass** |

## TC-05 — Trial counter input boundaries
**Scenario:** SC-07 · **Priority:** Medium (measurement accuracy)

| | |
|---|---|
| **Preconditions** | Inside a capture session (goal of type frequency) |
| **Steps** | 1. Type `-5` into the trial counter. 2. Read the value. 3. Clear it and type `12`. 4. Read the value. 5. Clear it and type `99999`. 6. Read the value. |
| **Expected** | Only plausible whole numbers are accepted; negative values and absurd values are rejected or clamped rather than stored |
| **Actual** | `-5` → stored as `5` (the minus sign is discarded). `12` → `12`. `99999` → not accepted as entered (value remained a small number). The field is `type="text"` with no `min`/`max`/`pattern`, but the app-level filter kept the value inside a sane range. |
| **Result** | **Pass** (guard-rail works) — cosmetic note: a keyboard hint is absent, so the value is not protected on touch devices |

## TC-06 — Edit an event's time window to end before it starts
**Scenario:** SC-08 · **Priority:** Medium

| | |
|---|---|
| **Preconditions** | Inside a session; event window 08:59 AM – 09:29 AM |
| **Steps** | 1. Click the event-time button (**Edit event time**). 2. Set the end hour to `07` (end = 07:07 AM, before the 08:59 AM start). 3. Observe the form. 4. Try to close the dialog. |
| **Expected** | The invalid window is rejected with a clear inline message and cannot be saved |
| **Actual** | Red inline message appeared: **"End time must be greater than Start time."** on the Time row. Leaving the dialog also triggered a **"Discard Unsaved Changes?"** confirmation instead of silently dropping the edit. |
| **Result** | **Pass** — the same class of guard that BUG-01 shows missing elsewhere |

## TC-07 — Refresh a running data-collection session *(critical-path regression)*
**Scenario:** SC-09 · **Priority:** Critical

| | |
|---|---|
| **Preconditions** | Signed in; inside an open session at `/session/<id>` (reached via **Take Data**) |
| **Steps** | 1. Confirm you are on `/session/<id>` with the capture controls visible. 2. Press **F5** (or click the app's **Back**/**reload**). 3. Observe the landing URL and page. 4. Independently, open a session URL you have used before (`/session/6ad049935a6f5152d0a69c27`) in the same tab. |
| **Expected** | The same session is restored (student, goal and event window intact) so a stray refresh cannot lose in-progress data |
| **Actual** | **Both routes landed on `/calendar`.** Reload of a live session → `/calendar`. Direct navigation to a previously used `/session/<id>` → `/calendar` (and on one attempt the app raised two red toasts *"You do not have permissions to perform this action"* before showing the calendar). The session itself was never rendered again; in-progress trial data entered on that screen was not recoverable from the UI. |
| **Result** | **Fail** — see **BUG-01**. Reproduced **2 / 2** independent attempts (reload and deep link) |

## TC-08 — Responsive readability of the Caseload grid (375 / 768 / desktop)
**Scenario:** SC-05 · **Priority:** Medium

| | |
|---|---|
| **Preconditions** | Signed in; Caseload with 3 students, one having IEP/Eval due dates |
| **Steps** | 1. Set the viewport to 375×667 and inspect the grid. 2. Set the viewport to 768×1024 and inspect the grid. 3. Compare date values against the known data (`03/25/2023`, `02/28/2023`). |
| **Expected** | Columns reduce gracefully; every visible value is complete, or shortened with an ellipsis/tooltip |
| **Actual** | At **375 px** the grid collapses to *Full Name + Actions* — usable, no clipping (pass). At **768 px** the grid adds *Last Name, IEP Due, Eval Due, Actions*, but the **Eval Due values are visibly cut off**: `03/25/20` and `02/28/20` instead of `03/25/2023` / `02/28/2023`, with no ellipsis and no tooltip; the Actions column sits flush against the truncated text. |
| **Result** | **Fail at tablet width** — see **BUG-05** (375 px pass, 768 px fail) |

---

### Case summary

| Result | Cases |
|---|---|
| **Pass** | TC-02, TC-04, TC-05, TC-06 (4) |
| **Fail** | TC-01, TC-03, TC-07, TC-08 (4) |
| **Blocked / not run** | 0 in this set — blocked areas (Pro-gated Billing, Groups paywall, service-time logging) are listed in the summary instead of being counted as passes |

Failures map to bug reports as: TC-01 → BUG-03 · TC-03 → BUG-02 · TC-07 → BUG-01 · TC-08 → BUG-05, plus BUG-04 found while exercising the same Add-Student flow as TC-03.
