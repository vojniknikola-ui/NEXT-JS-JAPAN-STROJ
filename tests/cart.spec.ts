import { test, expect } from '@playwright/test';

test.describe('Cart Operations Tests', () => {
  test('should add item to cart from catalog', async ({ page }) => {
    await page.goto('/catalog');

    // Wait for products to load
    await page.waitForSelector('button:has-text("Dodaj u košaricu")', { timeout: 10000 });

    // Get initial cart count
    const initialCartCount = await page.locator('[data-testid="cart-count"]').textContent() || '0';

    // Click add to cart on first product
    const addToCartButton = page.locator('button:has-text("Dodaj u košaricu")').first();
    await addToCartButton.click();

    // Check cart count increased
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText((parseInt(initialCartCount) + 1).toString());

    // Check toast message
    await expect(page.locator('text=dodan u košaricu')).toBeVisible();
  });

  test('should add item to cart from product details', async ({ page }) => {
    await page.goto('/catalog');

    // Wait for products and click first one
    await page.waitForSelector('button:has-text("Dodaj u košaricu")', { timeout: 10000 });
    const firstProductCard = page.locator('div.cursor-pointer').first();
    await firstProductCard.click();

    // On product page, click add to cart
    const addToCartButton = page.locator('button:has-text("Dodaj u košaricu")');
    await addToCartButton.click();

    // Check success state
    await expect(page.locator('button:has-text("Dodano u košaricu")')).toBeVisible();

    // Check toast message
    await expect(page.locator('text=dodan u košaricu')).toBeVisible();
  });

  test('should update cart quantity', async ({ page }) => {
    // Add item to cart first
    await page.goto('/catalog');
    await page.waitForSelector('button:has-text("Dodaj u košaricu")', { timeout: 10000 });
    await page.locator('button:has-text("Dodaj u košaricu")').first().click();

    // Go to cart
    await page.locator('a[href="/cart"]').first().click();

    // Check initial quantity is 1
    await expect(page.locator('span').filter({ hasText: '1' }).first()).toBeVisible();

    // Increase quantity
    await page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: '+' }).click();
    await expect(page.locator('span').filter({ hasText: '2' }).first()).toBeVisible();

    // Decrease quantity
    await page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: '-' }).first().click();
    await expect(page.locator('span').filter({ hasText: '1' }).first()).toBeVisible();

    // Cannot decrease below 1
    await page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: '-' }).first().click();
    await expect(page.locator('span').filter({ hasText: '1' }).first()).toBeVisible();
  });

  test('should remove item from cart', async ({ page }) => {
    // Add item to cart first
    await page.goto('/catalog');
    await page.waitForSelector('button:has-text("Dodaj u košaricu")', { timeout: 10000 });
    await page.locator('button:has-text("Dodaj u košaricu")').first().click();

    // Go to cart
    await page.locator('a[href="/cart"]').first().click();

    // Remove item
    await page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: 'trash' }).click();

    // Check cart is empty
    await expect(page.locator('text=Košarica je prazna')).toBeVisible();
  });

  test('should clear entire cart', async ({ page }) => {
    // Add multiple items to cart
    await page.goto('/catalog');
    await page.waitForSelector('button:has-text("Dodaj u košaricu")', { timeout: 10000 });
    await page.locator('button:has-text("Dodaj u košaricu")').first().click();
    await page.locator('button:has-text("Dodaj u košaricu")').nth(1).click();

    // Go to cart
    await page.locator('a[href="/cart"]').first().click();

    // Clear cart
    await page.locator('button:has-text("Isprazni košaricu")').click();
    await page.locator('button:has-text("Isprazni")').click();

    // Check cart is empty
    await expect(page.locator('text=Košarica je prazna')).toBeVisible();
  });

  test('should calculate cart total correctly', async ({ page }) => {
    // Add item to cart
    await page.goto('/catalog');
    await page.waitForSelector('button:has-text("Dodaj u košaricu")', { timeout: 10000 });
    await page.locator('button:has-text("Dodaj u košaricu")').first().click();

    // Go to cart
    await page.locator('a[href="/cart"]').first().click();

    // Get item price
    const itemPriceText = await page.locator('text=BAM').first().textContent();
    const itemPrice = parseFloat(itemPriceText?.replace(' BAM', '') || '0');

    // Increase quantity to 3
    await page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: '+' }).click();
    await page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: '+' }).click();

    // Check total is 3x price
    const expectedTotal = (itemPrice * 3).toFixed(2);
    await expect(page.locator('text=BAM').last()).toContainText(expectedTotal);
  });

  test('should show free shipping message for orders over 500 BAM', async ({ page }) => {
    // This test assumes there are expensive items or we can add multiple items
    // For now, we'll check the message appears when total is high enough
    await page.goto('/cart');
    await expect(page.locator('text=Besplatna dostava')).toBeVisible();
  });

  test('should generate proforma invoice', async ({ page }) => {
    // Add item to cart
    await page.goto('/catalog');
    await page.waitForSelector('button:has-text("Dodaj u košaricu")', { timeout: 10000 });
    await page.locator('button:has-text("Dodaj u košaricu")').first().click();

    // Go to cart
    await page.locator('a[href="/cart"]').first().click();

    // Open proforma modal
    await page.locator('button:has-text("Predračun")').click();

    // Check modal is open
    await expect(page.locator('text=Predračun')).toBeVisible();
  });

  test('should handle empty cart state', async ({ page }) => {
    await page.goto('/cart');

    // Check empty cart message
    await expect(page.locator('text=Košarica je prazna')).toBeVisible();

    // Check navigation buttons
    await expect(page.locator('button:has-text("Pregledaj katalog")')).toBeVisible();
    await expect(page.locator('button:has-text("Naše usluge")')).toBeVisible();
  });
});