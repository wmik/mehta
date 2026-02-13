import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');

    // await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.locator('[data-slot="alert"]')).toBeVisible({
      timeout: 10000
    });
  });

  test('should redirect to dashboard with valid credentials', async ({
    page
  }) => {
    await page.goto('/login');

    const navigationPromise = page.waitForURL('**/dashboard');
    await page.getByLabel(/email/i).fill('supervisor@shamiri.org');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await navigationPromise;

    await expect(page).toHaveURL('/dashboard');
    await expect(
      page.getByRole('heading', { name: /dashboard/i })
    ).toBeVisible();
  });
});
