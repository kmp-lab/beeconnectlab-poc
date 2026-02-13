import { test, expect } from '@playwright/test';

test.describe('Web Announcements', () => {
  test('should display announcements page', async ({ page }) => {
    await page.goto('/announcements');

    await expect(
      page.getByRole('heading', { name: '공고 목록' }),
    ).toBeVisible();
  });

  test('should show announcements or empty state', async ({ page }) => {
    await page.goto('/announcements');

    // Wait for loading to finish
    await expect(page.getByText('불러오는 중...')).toBeHidden({
      timeout: 10000,
    });

    // Either announcement cards or empty message should be visible
    const emptyMessage = page.getByText('등록된 공고가 없습니다.');
    const announcementCards = page
      .locator('a[href^="/announcements/"]')
      .first();

    await expect(emptyMessage.or(announcementCards)).toBeVisible();
  });

  test('should navigate to announcement detail if cards exist', async ({
    page,
  }) => {
    await page.goto('/announcements');

    await expect(page.getByText('불러오는 중...')).toBeHidden({
      timeout: 10000,
    });

    const firstCard = page.locator('a[href^="/announcements/"]').first();

    if (await firstCard.isVisible()) {
      await firstCard.click();
      await page.waitForURL(/\/announcements\/.+/);
      // Detail page should have loaded
      await expect(page.locator('main')).toBeVisible();
    }
  });
});
