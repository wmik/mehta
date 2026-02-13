import { test, expect } from '@playwright/test';

test.describe('Session Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each session test
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('supervisor@shamiri.org');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');
  });

  test('should display dashboard with sessions', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /dashboard/i })
    ).toBeVisible();
  });

  test('should navigate to session detail', async ({ page }) => {
    // Check if there are any session links
    const sessionLinks = page.locator('a[href*="/dashboard/sessions/"]');
    const count = await sessionLinks.count();

    if (count > 0) {
      await sessionLinks.first().click();
      await expect(page).toHaveURL(/\/dashboard\/sessions\//);
    }
  });
});
