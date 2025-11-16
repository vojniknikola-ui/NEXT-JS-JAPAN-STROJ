import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test('should navigate between all main pages', async ({ page }) => {
    // Start from home page
    await page.goto('/');
    await expect(page).toHaveTitle(/JapanStroj/);
    await expect(page.locator('h1').filter({ hasText: 'JapanStroj' })).toBeVisible();

    // Navigate to catalog
    await page.locator('a[href="/catalog"]').first().click();
    await expect(page).toHaveURL(/\/catalog$/);
    await expect(page.locator('h1').filter({ hasText: 'Katalog rezervnih dijelova' })).toBeVisible();

    // Navigate to services
    await page.locator('a[href="/services"]').first().click();
    await expect(page).toHaveURL(/\/services$/);
    await expect(page.locator('h1').filter({ hasText: 'Naše usluge' })).toBeVisible();

    // Navigate to manuals
    await page.locator('a[href="/manuals"]').first().click();
    await expect(page).toHaveURL(/\/manuals$/);
    await expect(page.locator('h1').filter({ hasText: 'Priručnici' })).toBeVisible();

    // Navigate to cart
    await page.locator('a[href="/cart"]').first().click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.locator('h1').filter({ hasText: 'Košarica' })).toBeVisible();

    // Navigate back to home
    await page.locator('a[href="/"]').first().click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('h1').filter({ hasText: 'JapanStroj' })).toBeVisible();
  });

  test('should navigate using mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport

    await page.goto('/');

    // Open mobile menu
    await page.locator('button[aria-label="Toggle mobile menu"]').click();

    // Check mobile menu is open
    await expect(page.locator('div.fixed.inset-0.z-40')).toBeVisible();

    // Navigate to catalog via mobile menu
    await page.locator('a[href="/catalog"]').nth(1).click(); // Second instance is mobile menu
    await expect(page).toHaveURL(/\/catalog$/);

    // Open mobile menu again
    await page.locator('button[aria-label="Toggle mobile menu"]').click();
    await expect(page.locator('div.fixed.inset-0.z-40')).toBeVisible();

    // Navigate to cart via mobile menu
    await page.locator('a[href="/cart"]').nth(1).click();
    await expect(page).toHaveURL(/\/cart$/);
  });

  test('should navigate to product details from catalog', async ({ page }) => {
    await page.goto('/catalog');

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // Click on first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();

    // Should be on product detail page
    await expect(page).toHaveURL(/\/product\/\d+$/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should navigate back from product details', async ({ page }) => {
    await page.goto('/catalog');

    // Wait for products and click first one
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    const productLink = await firstProduct.getAttribute('href');
    await firstProduct.click();

    // On product page, click back to catalog
    await page.locator('button').filter({ hasText: 'Nastavi kupovinu' }).click();
    await expect(page).toHaveURL(/\/catalog$/);
  });

  test('should handle 404 for invalid product', async ({ page }) => {
    await page.goto('/product/999999');
    await expect(page.locator('h1').filter({ hasText: 'Proizvod nije pronađen' })).toBeVisible();
  });
});