const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  use: {
    browserName: 'chromium',
    viewport: { width: 1360, height: 950 },
    launchOptions: process.env.CPGEN_CHROME ? { executablePath: process.env.CPGEN_CHROME } : {},
  },
});
