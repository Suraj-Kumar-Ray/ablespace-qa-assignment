import { test, expect } from '@playwright/test'

/**
 * BUG-01 — refreshing (or deep-linking back into) a data-capture session drops the
 * user on /calendar instead of restoring the session.
 *
 * The assertions below describe the CORRECT behaviour. They are marked `test.fail()`
 * so the suite stays green while the defect is open and, more importantly, so the run
 * turns RED with "unexpected pass" the moment it is fixed — at which point this marker
 * should be removed. Nothing here has been weakened to make it pass.
 */
test.describe('Data-capture session persistence', () => {
  test('TC-07 (BUG-01) — reloading a live session keeps the therapist in that session', async ({ page }) => {
    test.fail() // known defect on this build — see 03-bug-reports.md

    await page.goto('/caseload')
    await page.locator('a[href*="takeData"] button').first().click()
    await expect(page).toHaveURL(/\/session\//)
    const sessionUrl = page.url()

    await page.reload()

    // Evidence: what the user actually sees after a stray refresh.
    await page.screenshot({ path: '../evidence/BUG-01-reload-landed-here.png', fullPage: true })
    console.log(`[BUG-01] session URL before reload: ${sessionUrl}`)
    console.log(`[BUG-01] URL after reload:           ${page.url()}`)

    await expect(page, 'a reload must restore the same session, not leave the capture screen').toHaveURL(/\/session\//)
  })

  test('TC-07b (BUG-01) — reopening a session URL in the same tab restores the session', async ({ page }) => {
    test.fail() // known defect on this build — see 03-bug-reports.md

    await page.goto('/caseload')
    await page.locator('a[href*="takeData"] button').first().click()
    await expect(page).toHaveURL(/\/session\//)
    const sessionUrl = page.url()

    await page.goto('/caseload')
    await page.goto(sessionUrl)

    await page.screenshot({ path: '../evidence/BUG-01-deeplink-landed-here.png', fullPage: true })
    console.log(`[BUG-01] deep link ${sessionUrl} resolved to ${page.url()}`)

    await expect(page, 'a session deep link must render the session, not redirect to the calendar').toHaveURL(/\/session\//)
  })
})
