import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Admin Programs', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display programs page', async ({ page }) => {
    await page.goto('/programs');

    await expect(
      page.getByRole('heading', { name: /프로그램 관리/ }),
    ).toBeVisible();

    // Table or empty state should be visible
    await expect(
      page.locator('table').or(page.getByText('등록된 프로그램이 없습니다.')),
    ).toBeVisible();
  });

  test('should navigate to new program form', async ({ page }) => {
    await page.goto('/programs');

    await page.getByRole('link', { name: '새 프로그램' }).click();

    await page.waitForURL('**/programs/new');

    await expect(
      page.getByRole('heading', { name: '새 프로그램 등록' }),
    ).toBeVisible();

    // Verify form fields are present
    await expect(page.getByText('프로그램명')).toBeVisible();
    await expect(page.getByText('주최')).toBeVisible();
    await expect(page.getByText('주관')).toBeVisible();
    await expect(page.getByText('활동 시작일')).toBeVisible();
    await expect(page.getByText('활동 종료일')).toBeVisible();
  });
});
