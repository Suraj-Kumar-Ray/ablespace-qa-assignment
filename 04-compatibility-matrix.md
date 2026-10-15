# AbleSpace (staging.ablespace.io) — Cross-Browser & Responsive Matrix

Executed **15 Oct 2026**. This matrix reports only what was actually run; unexecuted cells are marked **Not run** rather than assumed, and the reason is given. I had exactly one browser engine available in this environment (Chromium), so the engine rows are deliberately honest.

## 1. Engine / browser coverage

| Browser | Version | Platform | Engine rows executed | Result |
|---|---|---|---|---|
| Chromium (desktop) | Chromium-based preview browser, DPR 1.25 | Windows 11 | Register → onboarding → Caseload → Add Student → Take Data → session → Calendar → responsive widths | **Executed** — core flows work; 5 defects found (see `03-bug-reports.md`) |
| Google Chrome (stable) | — | Windows 11 | — | **Not run** — no separate Chrome binary in this environment; the executed engine is Chromium, so Chrome results are *expected* to match but are not proven |
| Microsoft Edge | — | Windows 11 | — | **Not run** — same reason; shares the Chromium engine |
| Mozilla Firefox | — | — | — | **Not run** — engine not available in this environment |
| Apple Safari / iOS Safari | — | — | — | **Not run** — engine not available; requires macOS/iOS hardware |
| Android Chrome | — | — | — | **Not run** — no device/emulator available |

**What this means for the reader:** the functional defects in `03-bug-reports.md` are engine-independent by nature — BUG-01 is a routing/state issue, BUG-02 an input-validation gap, BUG-03 an error-mapping gap, BUG-04 static copy, BUG-05 a CSS column-width issue. None of them depends on a Chromium-only API, so they should reproduce in Firefox and Safari, but that is an inference, not a measurement, and I am labelling it as such.

## 2. Responsive / viewport matrix (executed, Chromium engine)

Reviewed at three widths with the Caseload table in view, plus the signup, onboarding, data-capture and update-event screens at desktop width.

| Viewport (CSS px) | Device class | Caseload layout observed | Result |
|---|---|---|---|
| 375 × 667 | Mobile (iPhone-class) | Email banner wraps to two lines; nav collapses to hamburger + headings; grid drops to **Full Name + Actions** only; Add-Student **+** becomes icon-only; row actions reachable | **Pass** — no clipping, no horizontal page scroll |
| 768 × 1024 | Tablet (iPad-portrait class) | Grid adds *Last Name, IEP Due, **Eval Due**, Actions* | **Fail — see BUG-05:** Eval Due values render clipped (`03/25/20`, `02/28/20`) with no ellipsis or tooltip; Actions column sits flush against the cut text |
| ≈656 × 715 CSS px (captured as 820 × 894 at DPR 1.25) | Small desktop / split window | Grid shows *Full Name, Last Name, IEP Due, Actions*; Eval Due correctly hidden rather than clipped; full student names, dates and both row actions legible | **Pass** |

Observation while sweeping widths: the column set changes at several breakpoints, and the only width band that produced *clipped* (rather than *hidden*) columns was the tablet band — so the safe behaviour exists in the codebase, it is simply not applied at 768 px.

## 3. Rendering / theming checks

| Check | Method | Observed | Verdict |
|---|---|---|---|
| Dark-mode rendering | Emulated `prefers-color-scheme: dark` on Caseload | App stays light (no dark palette); text contrast remains fine, nothing invisible | **Observation, not a defect** — light-only theming is a product decision; worth confirming it is intentional |
| Zoom / DPR | DPR 1.25 rendering | Layout and hit targets behave; no misplaced overlays | **Pass** |
| Text overlap at narrow width | Visual inspection at 375 px | Header, banner and search field reflow without overlap | **Pass** |

## 4. Data-flow / environment checks worth repeating per browser

These are the flows a full cross-browser pass should re-run, because they exercise state and routing (where BUG-01 lives):

1. Register → onboarding → Caseload, on a **fresh profile with third-party cookies cleared** (reCAPTCHA on signup, BUG-03).
2. Open a session with **Take Data**, then **reload** (BUG-01) and use the browser's back/forward gesture.
3. Open a `/session/<id>` URL in a **new tab** (BUG-01).
4. Create a student with a future DOB (BUG-02).
5. Resize through 375 → 768 → 1024 px and read every date cell (BUG-05).

## 5. Gaps I am explicitly not claiming coverage for

- **Firefox and WebKit browsers** — not executed (see §1).
- **Touch input, on-screen keyboards, and mobile OS share/screenshot flows** — not executed; the trial counter is `type="text"` with no `inputmode`, so touch-keyboard behaviour is untested and worth a manual check.
- **Screen readers / keyboard-only navigation and focus order** — not executed; no automated a11y scan was run either, so this build must not be described as accessibility-verified.
- **Slow-network / offline behaviour** — not executed; no throttling was applied, and the reload behaviour in BUG-01 was only observed on a fast connection.
- **Browser-extension interference and pop-up blockers** — not executed.

Where a flow could not be run, it is listed above; nothing blocked was recorded as a pass.
