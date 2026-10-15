# AbleSpace (staging.ablespace.io) — Bug Reports

Five defects were found and reproduced on **15 Oct 2026** against the live staging build in Chromium. Every report lists the exact steps, what the app did, and what evidence was captured. Severity is my call as a tester; priority is what I would argue for a product owner.

Environment for all reports: `https://staging.ablespace.io` · Chromium (desktop, 658×771 CSS px, DPR 1.25) · Windows 11 · account `csesuraj2003@gmail.com` (*QA Tester*, role *Special Education Teacher*) · all times IST, 15 Oct 2026.

| ID | Title | Severity | Priority | Reproduced |
|----|-------|----------|----------|------------|
| BUG-01 | Refreshing or reopening a data-capture session silently redirects to Calendar | **High** | P1 | 2/2 |
| BUG-02 | A future date of birth is accepted when creating a student | Medium | P2 | 2/2 |
| BUG-03 | Signup shows a raw Firebase error on the first submit; only a blind retry works | Medium | P2 | 2/2 |
| BUG-04 | The manual "Add Student" dialog is titled "Bulk Add Students" | Low | P3 | 2/2 |
| BUG-05 | "Eval Due" values are truncated in the Caseload grid at tablet width | Medium | P2 | 2/2 |

---

## BUG-01 — Refreshing or reopening a data-capture session silently redirects to Calendar

**Severity:** High · **Priority:** P1 · **Reproduced:** 2/2 · **Related case:** TC-07 (SC-09)

**Environment:** staging build, Chromium desktop. Tested with two different students and two different sessions.

**Preconditions:** Signed in. A data-capture session opened the normal way (Caseload → row action **Take Data**), URL `/session/<id>`.

**Steps to reproduce**
1. On Caseload, click **Take Data** for a student who has a goal (e.g. *Demo Student1*) and wait for the capture screen.
2. Confirm the screen renders: event window in the header, student chip, goal banner, trial counter.
3. Press **F5** to reload the page.
4. Observe the URL and the page that is rendered.
5. *(Second route, same defect)* In the same tab, navigate to a `/session/<id>` URL that was used a few minutes earlier.

**Expected:** The same session is restored — student, goal and event window intact — so an accidental refresh (or a bookmarked/deep-linked session) does not interrupt data collection.

**Actual:** Step 4 lands on **`/calendar`**, not the session. The session screen is never rendered again and the page shows the week's events (two entries named *New Session*). Step 5 behaves the same way: the `/session/<id>` URL redirects to `/calendar`, and on one attempt the app first raised **two red toasts reading "You do not have permissions to perform this action"** before the calendar appeared. In-progress trial entry on that screen could not be recovered from the UI afterwards.

**Impact:** This is the product's critical path. Therapists capture trials one at a time in front of a student; a stray refresh, a mis-tap on the browser back/forward gesture, an incoming call that reloads the tab, or an IT-forced reload all drop the user out of the session into the calendar with no message, no retry and no way back to the same session. The permission toasts on entry make it look like an authorisation failure even though the user owns the session, which would generate support tickets. It also breaks any shared/bookmarked session link and any "reopen last session" habit.

**Evidence captured**
- Direct navigation to `/session/6ad049935a6f5152d0a69c27` ended at `https://staging.ablespace.io/calendar`.
- Reload inside `/session/6ad04a203f836b3210d05ab3` (opened via **Take Data**) ended at `https://staging.ablespace.io/calendar`.
- Calendar screenshot shows the created events (`09:03 AM New Session`, `10:00 AM New Session`) instead of the capture screen.
- Two `"You do not have permissions to perform this action"` toasts observed on the redirect landing.

**Suggested fix direction:** On `/session/:id`, resolve the session from the route (or from the pending `takeData` param) instead of relying on in-memory navigation state; if resolution genuinely fails, show a blocking "session could not be restored" state with a retry and a Back-to-Caseload action rather than a silent redirect; and make the trial/notes state durable (server-autosave or local draft) so a reload cannot lose captured data.

---

## BUG-02 — A future date of birth is accepted when creating a student

**Severity:** Medium · **Priority:** P2 · **Reproduced:** 2/2 · **Related case:** TC-03 (SC-04)

**Preconditions:** Signed in; Caseload → **Add Student** → **Add Manually**.

**Steps to reproduce**
1. Enter First Name `Test`, Last Name `Student`.
2. Set **DOB** to `12/31/2030` (about four years in the future).
3. Leave School Name, Grade, Teacher and the due dates empty.
4. Click **Create**.

**Expected:** The record is rejected, or at minimum the field is flagged inline — 12/31/2030 cannot be the birth date of a student receiving services today (15 Oct 2026).

**Actual:** The student is created. The toast **"Student created successfully"** appears, `Students (2)` becomes `Students (3)`, and the new row `Test Student | Student | - | -` is listed in the caseload. No inline error, no warning, no confirmation prompt.

**Impact:** AbleSpace holds clinical and compliance data (HIPAA/FERPA are advertised on the signup page). A birth date is the anchor for age-based eligibility, evaluation timelines and Medicaid billing, and it feeds IEP/Eval due-date maths and reports. A silent future date produces wrong ages and wrong due dates downstream, and it survives in exports and admin dashboards. The same class of input (IEP Due / Eval Due) is equally unvalidated.

**Evidence captured:** DOB input value `12/31/2030` read from the DOM immediately before submit; success toast text; the caseload header count going to 3; the new `Test Student` row with `-` due dates.

**Suggested fix direction:** Block future DOB at the field level and re-validate at submit (also sanity-check implausibly old dates), and apply the same rule to IEP/Eval due dates. Ideally validate on the API too, so the mobile apps and imports cannot bypass it.

---

## BUG-03 — Signup shows a raw Firebase error on the first submit; only a blind retry works

**Severity:** Medium · **Priority:** P2 · **Reproduced:** 2/2 · **Related case:** TC-01 (SC-01)

**Preconditions:** Signed out; `/signup` with name, e-mail, role and a strong password filled in and the Privacy-Policy box ticked; **Continue** enabled.

**Steps to reproduce**
1. Fill the full "Create a Free Account" form (name, role from the Role dropdown, 21-character password showing *Password Strength: Strong*, policy checked).
2. Click **Continue** and wait.
3. Read the message that appears at the bottom of the form.
4. Click **Continue** again without changing anything.

**Expected:** A human-readable message for a machine-check failure ("We couldn't verify this signup — please try again", or a visible reCAPTCHA prompt), and a working retry.

**Actual:** Step 3 shows the raw SDK string **`Firebase: Error (auth/invalid-recaptcha-token)`** verbatim at the bottom of the signup form. The form keeps all values. Step 4 — an identical submit — succeeds and moves the user to `/onboarding`. Network log shows the first `POST /v1/accounts:signUp` to `identitytoolkit.googleapis.com` returning **400**, and the flow runs an invisible reCAPTCHA Enterprise (`sitekey 6Lfn_qklAAAAAJDQQ2r4LtDG5gdES5xYMhj3V7oi`).

**Impact:** This is the first screen every new user sees, and a raw `auth/invalid-recaptcha-token` string is meaningless to a teacher signing up. Because the message never says "try again", the likely user behaviour is to change their details (or abandon signup) rather than simply re-submitting — a preventable hole at the top of the funnel. A first-attempt machine-check failure that succeeds on an identical retry also suggests the token is being requested or attached too early (or the retry path is what actually mints a fresh token), which is worth an engineering look rather than a copy change alone.

**Evidence captured:** the exact error string rendered in the form; the 400 from `accounts:signUp` on attempt 1 followed by success on attempt 2; the invisible reCAPTCHA Enterprise requests in the network log.

**Suggested fix direction:** Map auth error codes to product copy with a retry affordance (and never surface `Firebase: Error (...)` to end users); ensure the reCAPTCHA token is freshly executed immediately before the signup call; log which error code was received so the rate of this failure is measurable.

> **Note on method:** this failure surfaced inside an automated browser session, so part of the cause may be reCAPTCHA scoring the session — which is exactly why the report focuses on what is unambiguously wrong for *any* user: the raw error text, the absence of a retry instruction, and the fact that the same input fails once and then succeeds.

---

## BUG-04 — The manual "Add Student" dialog is titled "Bulk Add Students"

**Severity:** Low · **Priority:** P3 · **Reproduced:** 2/2 · **Related case:** TC-03 (SC-01/SC-04)

**Preconditions:** Signed in; Caseload → **+ Add Student**.

**Steps to reproduce**
1. Click **+ Add Student**.
2. Read the heading of the dialog that opens.
3. Note the three options offered: *Add Manually*, *Bulk Add Manually*, *Upload IEP*.
4. Click **Add Manually** and read the next screen's heading.

**Expected:** The entry dialog is titled consistently with the action that opened it (e.g. "Add Student"), and it is not labelled for a bulk operation unless the user chose the bulk path.

**Actual:** Tapping **+ Add Student** opens a dialog whose only heading text is **"Bulk Add Students"**, even though it is a chooser that includes a non-bulk *Add Manually* option and an *Upload IEP* option. Choosing *Add Manually* then shows a correctly titled **"Add Student"** form.

**Impact:** Users reasonably read the first heading as "you are about to add students in bulk" and back out, or look for a different entry point. It is a one-line copy defect but it sits on the most-used creation flow and it contradicts the very options listed beneath it.

**Evidence captured:** dialog DOM text (`Bulk Add Students` … `Add Manually` / `Bulk Add Manually` / `Upload IEP`) and the follow-up form heading `Add Student`.

**Suggested fix direction:** Title the chooser "Add Student" and reserve "Bulk Add Students" for the second option.

---

## BUG-05 — "Eval Due" values are truncated in the Caseload grid at tablet width

**Severity:** Medium · **Priority:** P2 · **Reproduced:** 2/2 · **Related case:** TC-08 (SC-05)

**Environment:** same build, viewport 768×1024 CSS px (a common iPad-portrait / small-laptop width; page zoom 100%).

**Preconditions:** Signed in; Caseload table view with students that have both IEP and Eval due dates.

**Steps to reproduce**
1. Open Caseload in table view with at least one student that has an Eval Due date (`03/25/2023`).
2. Set the viewport to 768×1024.
3. Read the **Eval Due** column.

**Expected:** Every visible value is complete, or shortened with an ellipsis and available in a tooltip/expanded row.

**Actual:** The column renders clipped values with no ellipsis and no tooltip — **`03/25/20`** and **`02/28/20`** instead of `03/25/2023` and `02/28/2023` — while the adjacent **Actions** column sits flush against the cut text. At 375 px the grid collapses sensibly (Full Name + Actions only, nothing clipped); the defect appears specifically in the intermediate widths where the extra columns are switched on.

**Impact:** Due dates drive compliant timelines, and `03/25/20` versus `03/25/2023` is unknowable — worse than showing nothing, because it looks like real data. A therapist scanning the caseload on a tablet before a meeting can act on a wrong year. (An empty value would render as `-`, so a clipped value is indistinguishable from a short one at a glance.)

**Evidence captured:** tablet screenshot showing the truncated dates next to the full IEP Due values; source values taken from the client-side row data (`03/25/2023`, `02/28/2023`).

**Suggested fix direction:** Give date columns a minimum width (or make the grid scroll horizontally past the breakpoint) and apply `text-overflow: ellipsis` with a title/tooltip as a fallback.

---

## Severity rationale (why BUG-01 outranks the rest)

BUG-01 can destroy a therapist's in-session work with a single keypress and presents itself as an authorisation failure, so it is both the most likely to occur and the most damaging. BUG-02 and BUG-05 corrupt or hide clinical dates, which is a compliance risk. BUG-03 costs new signups at the front door. BUG-04 is copy only, and cheap to fix in the same release.
