import { test, expect } from '@playwright/test'

/**
 * Regression coverage for the Caseload screen.
 * These are the checks that currently PASS — they exist so a fix for the defects
 * in the other specs cannot silently break the behaviour that already works.
 */
test.describe('Caseload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/caseload')
    await expect(page.locator('.ag-center-cols-container .ag-row').first()).toBeVisible()
  })

  test('TC-02 — search filters the list and a no-match search shows an empty state', async ({ page }) => {
    const rows = page.locator('.ag-center-cols-container .ag-row')
    const total = await rows.count()
    expect(total, 'the seeded caseload should have at least one student').toBeGreaterThan(0)

    // A search with no match must explain itself instead of showing a blank grid.
    await page.getByRole('searchbox', { name: /search students/i }).fill('zzzz')
    await expect(page.locator('.ag-overlay')).toContainText(/no matching results found/i)
    await expect(rows).toHaveCount(0)

    // Clearing must restore the original list, not an empty one.
    await page.getByRole('searchbox', { name: /search students/i }).fill('')
    await expect(rows).toHaveCount(total)
  })

  test('TC-04 — Take Data opens a session for the clicked student', async ({ page }) => {
    await page.locator('a[href*="takeData"] button').first().click()

    // The session route plus the capture chrome is the proof that the session opened.
    await expect(page).toHaveURL(/\/session\//)
    await expect(page.getByRole('button', { name: /take data|select goal/i }).or(page.getByText(/trial/i))).toBeVisible()
    await expect(page.locator('body')).toContainText(/capture|select goal/i)
  })
})
