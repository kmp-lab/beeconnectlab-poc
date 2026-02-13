import { test, expect } from '@playwright/test';

test.describe('Web Login', () => {
  test('should display login page with social and email options', async ({
    page,
  }) => {
    await page.goto('/login');

    await expect(
      page.getByRole('heading', { name: '비커넥트랩' }),
    ).toBeVisible();

    await expect(page.getByText('카카오 로그인')).toBeVisible();
    await expect(page.getByText('Google 로그인')).toBeVisible();
    await expect(page.getByText('이메일 로그인')).toBeVisible();
  });

  test('should navigate to email login form', async ({ page }) => {
    await page.goto('/login');

    await page.getByText('이메일 로그인').click();

    await page.waitForURL('**/login/email**');

    await expect(
      page.getByRole('heading', { name: '이메일 로그인' }),
    ).toBeVisible();

    await expect(page.getByLabel('이메일')).toBeVisible();
    await expect(page.getByLabel('비밀번호')).toBeVisible();
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
  });
});
