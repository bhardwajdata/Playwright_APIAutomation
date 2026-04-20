// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  workers: 3,
  fullyParallel: true,

  reporter: [
    ['list'],
    ['playwright-smart-reporter', {
      outputFolder: 'test-results',
      filename: 'report.html',
      open: 'never'
    }]
  ],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});