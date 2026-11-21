const { test, expect } = require('@playwright/test');
const { join } = require('node:path');
const { pathToFileURL } = require('node:url');
const site = process.env.CPGEN_URL || pathToFileURL(join(__dirname, '../index.html')).href;

async function openEditor(page) {
  await page.goto(site);
  await expect(page).toHaveTitle('Beine · Редактор КП');
  await expect(page.locator('#workspace')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#paper h1')).toHaveText('Изготовление и монтаж вывески');
}

test('public editor loads on desktop and mobile without script errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await openEditor(page);
  await expect(page.locator('#paper')).toContainText('[Реквизиты агентства]');
  await page.setViewportSize({ width: 390, height: 850 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  expect(errors).toEqual([]);
});

test('table totals recalculate and styling persists through PDF export', async ({ page }) => {
  await openEditor(page);
  const total = page.locator('#paper .table-total');
  await expect(total).toHaveText(/120\s000/);
  await page.locator('#paper .table-block [data-cell="2-1"] .ProseMirror').fill('45001');
  await expect(total).toHaveText(/120\s001/);
  await page.locator('#paper .table-block').hover();
  await page.locator('#paper .table-block').getByRole('button', { name: 'Стиль итога' }).click();
  await page.locator('#totalStyleAlign').selectOption('center');
  await page.locator('#totalStyleFont').selectOption('Georgia');
  await page.locator('#totalStyleSize').fill('24');
  await page.locator('#totalStyleColor').click();
  await page.locator('#colorPalette [data-color="#9b243c"]').click();
  await page.locator('#totalStyleDialog').getByRole('button', { name: 'Применить' }).click();
  await expect(total).toHaveCSS('text-align', 'center');
  await expect(total).toHaveCSS('font-size', '32px');
  await expect(total).toHaveCSS('color', 'rgb(155, 36, 60)');
  await expect(page.locator('#saveState')).toHaveText('Сохранено в браузере');
  await page.reload();
  await expect(total).toHaveText(/120\s001/);
  await expect(total).toHaveCSS('color', 'rgb(155, 36, 60)');
  const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
  expect(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)).toHaveLength(1);
  await expect(page.locator('#printPaper .table-total')).toHaveCSS('text-align', 'center');
});
