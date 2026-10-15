import { test, expect } from '@playwright/test'

/**
 * BUG-02 — a future date of birth is accepted when creating a student.
 * BUG-05 — the "Eval Due" column is clipped at tablet width.
 *
 * As in session.spec.ts the assertions encode the CORRECT behaviour and are marked
 * `test.fail()` so the suite is green while the defects are open and red (unexpected
 * pass) once they are fixed.
 */
test.describe('Student creation and caseload readability', () => {
  test('TC-03 (BUG-02) — a student cannot be created with a future date of birth', async ({ page }) => {
    test.fail() // known defect on this build — see 03-bug-reports.md

    await page.goto('/caseload')
    const studentsBefore = await page.locator('.ag-center-cols-container .ag-row').count()

    await page.getByRole('button', { name: /add student/i }).click()
    await page.getByRole('heading', { name: /add manually/i }).click()

    const dialog = page.getByRole('dialog')
    await dialog.locator('input').nth(1).fill('Test')   // First Name
    await dialog.locator('input').nth(2).fill('Student') // Last Name
    // DOB is the first of the three MM/DD/YYYY fields
    await dialog.locator('input[placeholder="MM/DD/YYYY"]').first().fill('12/31/2030')
    await page.screenshot({ path: '../evidence/BUG-02-future-dob-entered.png' })

    await page.getByRole('button', { name: /^create$/i }).click()

    // Evidence: the outcome the user gets.
    await page.waitForTimeout(3000)
    await page.screenshot({ path: '../evidence/BUG-02-outcome.png', fullPage: true })
    const studentsAfter = await page.locator('.ag-center-cols-container .ag-row').count()
    console.log(`[BUG-02] students before=${studentsBefore} after=${studentsAfter} (DOB 12/31/2030)`)

    // Correct behaviour: the form refuses the record (inline error, or it stays open).
    const refused = await dialog.isVisible().catch(() => false)
    const inlineError = await page.getByText(/invalid|future|cannot be|must be/i).first().isVisible().catch(() => false)
    expect(refused || inlineError, 'a future DOB must be rejected by the form').toBe(true)
  })

  test('TC-08 (BUG-05) — Eval Due values are not clipped at tablet width', async ({ page }) => {
    test.fail() // known defect on this build — see 03-bug-reports.md

    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/caseload')

    const header = page.locator('.ag-header-cell', { hasText: 'Eval Due' }).first()
    await expect(header).toBeVisible()
    const colId = await header.getAttribute('col-id')
    expect(colId, 'the Eval Due column should have a col-id to target').toBeTruthy()

    const cell = page.locator('.ag-center-cols-container .ag-row .ag-cell').filter({ has: page.locator('.ag-cell-value') })
    const evalCell = page.locator(`.ag-center-cols-container .ag-cell[col-id="${colId}"]`).first()
    const rendered = (await evalCell.innerText()).trim()
    console.log(`[BUG-05] Eval Due cell text: "${rendered}"`)

    await page.screenshot({ path: '../evidence/BUG-05-tablet-truncated-dates.png', fullPage: true })

    // A clipped cell is one whose content is wider than the box that shows it,
    // with no ellipsis and no tooltip to recover the hidden characters.
    const clipped = await evalCell.evaluate((el) => {
      const nodes = [el, ...Array.from(el.querySelectorAll('*'))] as HTMLElement[]
      return nodes.some((n) => n.scrollWidth > n.clientWidth + 1)
    })
    void cell

    expect(clipped, 'Eval Due must render in full (or ellipsis + tooltip), not be silently cut off').toBe(false)
    await expect(evalCell).toHaveText(/^\d{2}\/\d{2}\/\d{4}$/)
  })
})
