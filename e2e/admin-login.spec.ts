import { test, expect } from '@playwright/test';

test.describe('Admin Login', () => {
  test('should login and redirect to dashboard', async ({ page }) => {
    await page.goto('/login');

    await expect(
      page.getByRole('heading', { name: '관리자 로그인' }),
    ).toBeVisible();

    await page.getByLabel('이메일').fill('admin@beeconnectlab.com');
    await page.getByLabel('비밀번호').fill('Admin1234!');
    await page.getByRole('button', { name: '로그인' }).click();

    await page.waitForURL('**/accounts');

    // Verify navigation links are visible
    await expect(
      page.getByRole('link', { name: '프로그램 관리' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: '공고 관리' })).toBeVisible();
    await expect(page.getByRole('link', { name: '지원서 관리' })).toBeVisible();
    await expect(page.getByRole('link', { name: '인재 관리' })).toBeVisible();
    await expect(page.getByRole('link', { name: '콘텐츠 관리' })).toBeVisible();
    await expect(page.getByRole('link', { name: '계정 관리' })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('이메일').fill('wrong@example.com');
    await page.getByLabel('비밀번호').fill('wrongpassword');
    await page.getByRole('button', { name: '로그인' }).click();

    await expect(
      page
        .locator('text=로그인 중 오류가 발생했습니다.')
        .or(page.locator('[class*="text-red"]')),
    ).toBeVisible();
  });
});
