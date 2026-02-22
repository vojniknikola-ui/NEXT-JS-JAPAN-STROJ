import { test, expect } from '@playwright/test';

test.describe('Error Handling Tests', () => {
  test('returns 404 for non-existent routes', async ({ page }) => {
    const response = await page.goto('/non-existent-page');
    expect(response?.status()).toBe(404);
  });

  test('shows fallback state for invalid product IDs', async ({ page }) => {
    await page.goto('/product/invalid-id');
    await expect(page.getByRole('heading', { name: 'Proizvod nije pronađen' })).toBeVisible();

    await page.goto('/product/-1');
    await expect(page.getByRole('heading', { name: 'Proizvod nije pronađen' })).toBeVisible();

    await page.goto('/product/999999999');
    await expect(page.getByRole('heading', { name: 'Proizvod nije pronađen' })).toBeVisible();
  });

  test('shows catalog API error state', async ({ page }) => {
    await page.route('**/api/parts**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Test failure' }),
      });
    });

    await page.goto('/catalog');
    await expect(page.getByRole('heading', { name: 'Greška pri učitavanju' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pokušaj ponovo' })).toBeVisible();
  });

  test('handles special-character search queries gracefully', async ({ page }) => {
    await page.goto('/catalog');
    await expect(page.getByTestId('catalog-search')).toBeVisible();

    await page.getByTestId('catalog-search').fill('!@#$%^&*()');
    await page.waitForTimeout(400);

    await expect(page.getByTestId('catalog-title')).toBeVisible();
  });

  test('handles slow API responses without crashing', async ({ page }) => {
    await page.route('**/api/parts**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 900));
      await route.continue();
    });

    await page.goto('/catalog');
    await expect(page.getByTestId('catalog-title')).toBeVisible();
    await expect(page.getByTestId('product-card').first()).toBeVisible();
  });
});
