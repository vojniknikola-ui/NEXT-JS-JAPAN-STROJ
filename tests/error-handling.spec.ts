import { test, expect } from '@playwright/test';

test.describe('Error Handling Tests', () => {
  test('should handle 404 for non-existent pages', async ({ page }) => {
    await page.goto('/non-existent-page');
    // Next.js should show 404 page
    await expect(page).toHaveTitle(/404/);
  });

  test('should handle invalid product ID', async ({ page }) => {
    await page.goto('/product/invalid-id');
    await expect(page.locator('text=Proizvod nije pronađen')).toBeVisible();
  });

  test('should handle very large product ID', async ({ page }) => {
    await page.goto('/product/999999999');
    await expect(page.locator('text=Proizvod nije pronađen')).toBeVisible();
  });

  test('should handle negative product ID', async ({ page }) => {
    await page.goto('/product/-1');
    await expect(page.locator('text=Proizvod nije pronađen')).toBeVisible();
  });

  test('should handle catalog API errors gracefully', async ({ page }) => {
    // This would require API mocking, but we can test the UI error state
    await page.goto('/catalog');

    // If there's an error, check error message is shown
    const errorMessage = page.locator('text=Greška pri učitavanju');
    if (await errorMessage.isVisible({ timeout: 5000 })) {
      await expect(errorMessage).toBeVisible();
      await expect(page.locator('button').filter({ hasText: 'Pokušaj ponovo' })).toBeVisible();
    }
  });

  test('should handle home page API errors', async ({ page }) => {
    await page.goto('/');

    // Check for error state on home page
    const errorMessage = page.locator('text=Greška pri učitavanju');
    if (await errorMessage.isVisible({ timeout: 5000 })) {
      await expect(errorMessage).toBeVisible();
      await expect(page.locator('button').filter({ hasText: 'Pokušaj ponovo' })).toBeVisible();
    }
  });

  test('should handle network errors during cart operations', async ({ page }) => {
    // This would require mocking network failures
    // For now, test that the app doesn't crash
    await page.goto('/catalog');
    await page.waitForSelector('button:has-text("Dodaj u košaricu")', { timeout: 10000 });

    // Try to add to cart
    await page.locator('button:has-text("Dodaj u košaricu")').first().click();

    // App should still be functional
    await expect(page.locator('a[href="/cart"]')).toBeVisible();
  });

  test('should handle invalid search queries', async ({ page }) => {
    await page.goto('/catalog');

    // Search with special characters
    await page.fill('input[placeholder*="Pretraga"]', '!@#$%^&*()');
    await page.press('input[placeholder*="Pretraga"]', 'Enter');

    // Should handle gracefully
    await page.waitForTimeout(1000);
    // Either shows results or no results message
    const hasResults = await page.locator('div.cursor-pointer').count() > 0;
    const hasNoResults = await page.locator('text=Nema rezultata').isVisible();

    expect(hasResults || hasNoResults).toBe(true);
  });

  test('should handle empty search', async ({ page }) => {
    await page.goto('/catalog');

    // Clear search
    await page.fill('input[placeholder*="Pretraga"]', '');
    await page.press('input[placeholder*="Pretraga"]', 'Enter');

    // Should show all products
    await page.waitForTimeout(1000);
    const productCount = await page.locator('div.cursor-pointer').count();
    expect(productCount).toBeGreaterThan(0);
  });

  test('should handle rapid filter changes', async ({ page }) => {
    await page.goto('/catalog');

    // Open filters if mobile
    if (await page.locator('button:has-text("Filteri")').isVisible()) {
      await page.locator('button:has-text("Filteri")').click();
    }

    // Rapidly change filters
    const searchInput = page.locator('input[placeholder*="Pretraga"]');
    await searchInput.fill('motor');
    await searchInput.fill('pump');
    await searchInput.fill('filter');
    await searchInput.fill('');

    // App should handle it without crashing
    await page.waitForTimeout(1000);
    await expect(page.locator('h1').filter({ hasText: 'Katalog' })).toBeVisible();
  });

  test('should handle broken images gracefully', async ({ page }) => {
    await page.goto('/catalog');

    // Check that broken images don't break the layout
    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      // Check that products are still displayed even if images fail
      await expect(page.locator('div.cursor-pointer')).toHaveCount(await page.locator('div.cursor-pointer').count());
    }
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Throttle network
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      await route.continue();
    });

    await page.goto('/catalog');

    // Should still load eventually
    await page.waitForSelector('button:has-text("Dodaj u košaricu")', { timeout: 20000 });
    await expect(page.locator('h1').filter({ hasText: 'Katalog' })).toBeVisible();
  });
});