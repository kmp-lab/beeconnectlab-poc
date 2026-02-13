import { type Page } from '@playwright/test';

export async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.getByLabel('이메일').fill('admin@beeconnectlab.com');
  await page.getByLabel('비밀번호').fill('Admin1234!');
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForURL('**/accounts');
}
