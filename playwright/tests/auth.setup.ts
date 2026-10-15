import fs from 'node:fs/promises'
import { test as setup, expect } from '@playwright/test'
import { STORAGE_STATE } from '../playwright.config'

/**
 * Signs in once through the real UI (e-mail step → password step) and saves the
 * authenticated browser state so the other specs do not repeat the login.
 *
 * Credentials are read from the environment; nothing secret is committed.
 *   ABLESPACE_EMAIL, ABLESPACE_PASSWORD
 */
setup('sign in and save storage state', async ({ page }) => {
  // Path B (when Firebase Auth's reCAPTCHA check blocks an automated browser): reuse a
  // state file exported from a real, manually signed-in browser session.
  const preSigned = process.env.ABLESPACE_STORAGE_STATE
  if (preSigned) {
    await fs.mkdir('.auth', { recursive: true })
    await fs.copyFile(preSigned, STORAGE_STATE)
    console.log(`[auth] reused supplied session state from ${preSigned}`)
    return
  }

  const email = process.env.ABLESPACE_EMAIL
  const password = process.env.ABLESPACE_PASSWORD
  if (!email || !password) {
    throw new Error(
      'Set ABLESPACE_EMAIL and ABLESPACE_PASSWORD, or supply ABLESPACE_STORAGE_STATE (see README).',
    )
  }

  await page.goto('/signin')
  await expect(page.locator('#email')).toBeVisible()

  // Step 1 — e-mail
  await page.locator('#email').fill(email)
  await page.getByRole('button', { name: 'Continue', exact: true }).click()

  // Step 2 — password
  await expect(page.locator('#password')).toBeVisible()
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: 'Continue', exact: true }).click()

  // Landing on the caseload is the proof that the session was established.
  await expect(page).toHaveURL(/\/caseload/, { timeout: 30_000 })
  await expect(page.locator('.ag-center-cols-container .ag-row').first()).toBeVisible({ timeout: 30_000 })

  await page.context().storageState({ path: STORAGE_STATE })
})
