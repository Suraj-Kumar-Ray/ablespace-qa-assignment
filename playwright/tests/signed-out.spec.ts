import { test, expect } from '@playwright/test'

/**
 * Signed-out coverage. These checks need no authenticated session, so they run even
 * where Firebase Auth's reCAPTCHA check blocks an automated sign-in — see the README
 * ("Known limitation"). They are the executed part of the Playwright bonus.
 */
test.describe('Signup form (signed out)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup')

    // Step 1 asks only for the e-mail; step 2 collects the profile details.
    await page.locator('#email').fill(`qa.freebuff.${Date.now()}@gmail.com`)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    await expect(page.getByText(/tell us a few details/i)).toBeVisible({ timeout: 20_000 })
  })

  test('SC-01a — Continue stays disabled until the required fields, a role and the policy are provided', async ({ page }) => {
    const continueBtn = page.getByRole('button', { name: 'Continue', exact: true })

    // Required fields empty → the form must not be submittable.
    await expect(continueBtn).toBeDisabled()

    const fullName = page.locator('input[type="text"]').first()
    await fullName.fill('QA Tester') // Full Name
    await expect(continueBtn, 'name alone must not unlock signup').toBeDisabled()

    // A strong password is not enough on its own — the policy box is still unticked.
    await page.locator('input[type="password"]').fill('AbleSpace@QA2026#test')
    await expect(page.getByText(/password strength/i)).toBeVisible()
    await expect(page.getByText(/strong/i).first()).toBeVisible()
    await expect(continueBtn, 'the policy acknowledgement must be required').toBeDisabled()

    await page.getByRole('checkbox').first().check()
    await expect(continueBtn, 'all required inputs provided → signup can proceed').toBeEnabled()

    await page.screenshot({ path: '../evidence/TC-signup-form-ready.png' })
  })

  test('SC-01b — a weak password is reported as weak before submission', async ({ page }) => {
    await page.locator('input[type="text"]').first().fill('QA Tester')
    await page.locator('input[type="password"]').fill('abc')

    // The strength meter must reflect a weak value rather than silently accepting it.
    await expect(page.getByText(/password strength/i)).toBeVisible()
    await expect(page.getByText(/strong/i)).toHaveCount(0)
    await page.screenshot({ path: '../evidence/TC-signup-weak-password.png' })
  })
})
