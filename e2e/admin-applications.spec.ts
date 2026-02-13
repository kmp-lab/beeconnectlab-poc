import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Admin Applications', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display applications page with filters', async ({ page }) => {
    await page.goto('/applications');

    await expect(
      page.getByRole('heading', { name: '지원서 관리' }),
    ).toBeVisible();

    // Verify filter buttons exist
    await expect(page.getByRole('button', { name: /지원상태/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /공고/ })).toBeVisible();
  });

  test('should display applications table', async ({ page }) => {
    await page.goto('/applications');

    // Wait for loading to finish
    await expect(page.getByText('로딩 중...')).toBeHidden({ timeout: 10000 });

    // Table should be visible with headers
    await expect(page.locator('table')).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: '공고명' }),
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: '이름' }),
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: '지원상태' }),
    ).toBeVisible();

    // Either data rows or empty state
    const emptyMessage = page.getByText('지원서가 없습니다.');
    const dataRow = page.locator('tbody tr').first();
    await expect(emptyMessage.or(dataRow)).toBeVisible();
  });

  test('should have export button', async ({ page }) => {
    await page.goto('/applications');

    await expect(
      page.getByRole('button', { name: '엑셀 다운로드' }),
    ).toBeVisible();
  });
});
