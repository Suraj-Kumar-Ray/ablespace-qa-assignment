# Evidence

## Present

| File | Produced by | Shows |
|---|---|---|
| `TC-signup-form-ready.png` | Playwright, `tests/signed-out.spec.ts` (run 1, passing) | `/signup` details step with name, a **Strong** password and the policy box ticked — **Continue** enabled. The valid state that makes the BUG-03 failure meaningful. |
| `TC-signup-weak-password.png` | Playwright, `tests/signed-out.spec.ts` (run 1, passing) | A 3-character password reported as weak, so the strength meter is genuinely wired to the value. |

## Regenerating the defect screenshots

The authenticated defect specs write their own evidence as they reproduce each bug. With a session supplied (see `../playwright/README.md`), this produces:

| File | Reproduces |
|---|---|
| `BUG-01-reload-landed-here.png` | BUG-01 — the page a therapist sees after refreshing inside a data-capture session |
| `BUG-01-deeplink-landed-here.png` | BUG-01 — the same outcome when reopening a `/session/<id>` URL |
| `BUG-02-future-dob-entered.png`, `BUG-02-outcome.png` | BUG-02 — DOB `12/31/2030` in the form, and the created-student outcome |
| `BUG-05-tablet-truncated-dates.png` | BUG-05 — clipped Eval Due cells at 768 × 1024 |

Screenshots taken by hand during this manual pass are attached in the task conversation (Caseload at 375/768 px, the *Add Student* dialog, the future-DOB success toast, the raw Firebase error, the notification bell with its permanent badge, the Update Event validation message, and the Calendar page that a refreshed session lands on).

Environment for every capture: `staging.ablespace.io`, Chromium, Windows 11, 15 Oct 2026, account `csesuraj2003@gmail.com`.
