# AbleSpace QA — Playwright suite (bonus)

Automated companion to the manual pass in the parent folder. Node 18+, `@playwright/test` 1.48.2, Chromium.

```bash
npm install
npx playwright install chromium

# public-page specs — no account needed, these run out of the box
npx playwright test --project=signed-out

# everything (needs a session, see "Known limitation")
ABLESPACE_EMAIL=you@example.com ABLESPACE_PASSWORD='your-password' npx playwright test
```

Credentials are read from the environment only; nothing is committed. `.auth/`, `node_modules/`, `test-results/` and `report/` are gitignored. Screenshots land in `../evidence/`.

## What is in here

| File | Purpose | State |
|---|---|---|
| `tests/signed-out.spec.ts` | Signup-form gating: required fields, strong-password meter, mandatory policy acknowledgement. No session required. | **Executed — 2/2 pass** (see the log in `../06-playwright-bonus.md`) |
| `tests/auth.setup.ts` | Signs in through the real UI once (e-mail step → password step) and saves the session for the other specs | Written; blocked in my environment (below) |
| `tests/caseload.spec.ts` | Regression cover for behaviour that currently works: search filters the list, no-match shows an empty state, **Take Data** opens a session | Written; needs a session |
| `tests/session.spec.ts` | BUG-01: reload / deep-link of a session must restore the session | Written; needs a session |
| `tests/students.spec.ts` | BUG-02 (future DOB accepted) and BUG-05 (Eval Due clipped at 768 px) | Written; needs a session |

The defect specs assert the **correct** behaviour and are marked `test.fail()`. While a defect is open the suite stays green; the moment it is fixed the run turns **red with "unexpected pass"**, which is the reminder to delete the marker. No assertion was weakened to make anything pass.

## Known limitation — automated sign-in is blocked, and that is itself a finding

On this build, a Playwright-driven sign-in fails at the Firebase call:

```
POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword
400  { "error": { "message": "CAPTCHA_CHECK_FAILED", "errors": [ { "reason": "invalid" } ] } }
```

The same credentials sign in fine from a normal browser window, and the signup path exposes the same root cause as the raw `auth/invalid-recaptcha-token` string reported as **BUG-03**. I did **not** attempt to defeat the CAPTCHA check — fingerprint spoofing and automation-hiding flags are out of scope for a QA pass. Two consequences worth passing to engineering:

1. The suite cannot authenticate itself, so any CI/E2E plan for this app needs a documented test-account path (a Firebase Auth emulator, a test-only bypass, or a session injected by the pipeline).
2. In the automated session the failed sign-in left the form on screen with **no visible error message**, which is consistent with BUG-03's error-handling gap; I could not confirm the behaviour for a genuinely wrong password, so it is an observation, not a raised defect.

## Running the full suite yourself

Because the CAPTCHA check blocks an automated first sign-in, supply a session instead of credentials:

1. Sign in to `staging.ablespace.io` in a normal browser.
2. Export the session as a Playwright storage state (cookies + localStorage), or run a short Playwright script once with `channel: 'chrome'`, `headless: false` and a fresh profile: sign in by hand in the window that opens, then call `context.storageState({ path: 'state.json' })`.
3. Point the suite at it — the setup step copies it into place and skips the UI login:

```bash
ABLESPACE_STORAGE_STATE=/path/to/state.json npx playwright test
```

Keep that file out of version control: it is a live session, not a fixture.

## Data the suite creates

`students.spec.ts` creates a student named *Test Student* on the staging account (the same record the manual pass created). Test with a marked name and clean it up, or point `ABLESPACE_BASE_URL` at a disposable environment.
