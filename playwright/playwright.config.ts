import { defineConfig, devices } from '@playwright/test'

// AbleSpace QA — Playwright bonus suite.
// Target is the staging build; credentials come from the environment so no secrets
// live in the repository (see README for the ABLESPACE_EMAIL / ABLESPACE_PASSWORD vars).
export const STORAGE_STATE = '.auth/state.json'

export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false, // one shared account drives the suite; keep it serial and deterministic
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'report', open: 'never' }]],
  use: {
    baseURL: process.env.ABLESPACE_BASE_URL || 'https://staging.ablespace.io',
    viewport: { width: 1280, height: 800 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    // 1. Public pages — needs no session, so it runs even when automated sign-in is blocked.
    {
      name: 'signed-out',
      testMatch: /signed-out\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // 2. One-off sign-in that saves the session for the authenticated specs.
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // 3. Authenticated regression + defect specs.
    {
      name: 'chromium',
      dependencies: ['setup'],
      testIgnore: [/auth\.setup\.ts/, /signed-out\.spec\.ts/],
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
    },
  ],
})
