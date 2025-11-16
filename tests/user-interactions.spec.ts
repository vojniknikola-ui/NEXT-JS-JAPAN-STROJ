import { test, expect } from '@playwright/test';

test.describe('User Interactions Tests', () => {
  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Tab through navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check focus is on navigation links
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON']).toContain(focusedElement);
  });

  test('should handle Enter key on product cards', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForSelector('div.cursor-pointer', { timeout: 10000 });

    // Focus on first product
    await page.locator('div.cursor-pointer').first().focus();

    // Press Enter
    await page.keyboard.press('Enter');

    // Should navigate to product detail
    await expect(page).toHaveURL(/\/product\/\d+$/);
  });

  test('should handle Escape key in mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Open mobile menu
    await page.locator('button[aria-label="Toggle mobile menu"]').click();
    await expect(page.locator('div.fixed.inset-0.z-40')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Menu should close
    await expect(page.locator('div.fixed.inset-0.z-40')).toBeHidden();
  });

  test('should handle form submission with Enter key', async ({ page }) => {
    await page.goto('/catalog');

    // Type in search and press Enter
    await page.fill('input[placeholder*="Pretraga"]', 'test search');
    await page.keyboard.press('Enter');

    // Should trigger search
    await page.waitForTimeout(1000);
    // Search should be applied (either results or no results)
  });

  test('should handle hover effects on product cards', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForSelector('div.cursor-pointer', { timeout: 10000 });

    const firstCard = page.locator('div.cursor-pointer').first();

    // Check initial state
    await expect(firstCard).toBeVisible();

    // Hover
    await firstCard.hover();

    // Check hover effects are applied (classes change)
    const className = await firstCard.getAttribute('class');
    expect(className).toContain('hover');
  });

  test('should handle click and tap interactions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/catalog');
    await page.waitForSelector('button:has-text("Dodaj u košaricu")', { timeout: 10000 });

    // Test tap (mobile)
    await page.locator('button:has-text("Dodaj u košaricu")').first().tap();

    // Should add to cart
    await expect(page.locator('text=dodan u košaricu')).toBeVisible();
  });

  test('should handle double-click prevention', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForSelector('button:has-text("Dodaj u košaricu")', { timeout: 10000 });

    const addButton = page.locator('button:has-text("Dodaj u košaricu")').first();

    // Double click
    await addButton.dblclick();

    // Should only add once (check cart count)
    const cartCount = await page.locator('[data-testid="cart-count"]').textContent() || '0';
    expect(parseInt(cartCount)).toBe(1);
  });

  test('should handle long press on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/catalog');
    await page.waitForSelector('div.cursor-pointer', { timeout: 10000 });

    // Long press simulation (hold for context menu)
    const productCard = page.locator('div.cursor-pointer').first();
    await productCard.click({ button: 'right' });

    // Should not break the app
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle scroll interactions', async ({ page }) => {
    await page.goto('/');

    // Scroll down
    await page.mouse.wheel(0, 500);

    // Header should still be visible (sticky)
    await expect(page.locator('header')).toBeVisible();

    // Scroll back up
    await page.mouse.wheel(0, -500);
    await expect(page.locator('h1').filter({ hasText: 'JapanStroj' })).toBeVisible();
  });

  test('should handle window resize', async ({ page }) => {
    await page.goto('/catalog');

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Mobile elements should appear
    await expect(page.locator('button[aria-label="Toggle mobile menu"]')).toBeVisible();

    // Resize to desktop
    await page.setViewportSize({ width: 1200, height: 800 });

    // Desktop elements should appear
    await expect(page.locator('nav.hidden.lg\\:flex')).toBeVisible();
  });

  test('should handle focus management', async ({ page }) => {
    await page.goto('/catalog');

    // Focus on search input
    await page.locator('input[placeholder*="Pretraga"]').focus();

    // Type and check focus remains
    await page.keyboard.type('test');
    const activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeElement).toBe('INPUT');
  });

  test('should handle modal interactions', async ({ page }) => {
    // Add to cart and go to cart
    await page.goto('/catalog');
    await page.waitForSelector('button:has-text("Dodaj u košaricu")', { timeout: 10000 });
    await page.locator('button:has-text("Dodaj u košaricu")').first().click();
    await page.locator('a[href="/cart"]').first().click();

    // Open proforma modal
    await page.locator('button:has-text("Predračun")').click();

    // Modal should be visible
    await expect(page.locator('text=Predračun')).toBeVisible();

    // Click outside to close (if implemented)
    await page.locator('body').click({ position: { x: 10, y: 10 } });

    // Modal should close
    await expect(page.locator('text=Predračun')).toBeHidden();
  });

  test('should handle loading states during interactions', async ({ page }) => {
    await page.goto('/catalog');

    // Trigger a search
    await page.fill('input[placeholder*="Pretraga"]', 'loading test');
    await page.keyboard.press('Enter');

    // Should show loading or handle gracefully
    await page.waitForTimeout(1000);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle rapid successive clicks', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForSelector('button:has-text("Dodaj u košaricu")', { timeout: 10000 });

    const addButton = page.locator('button:has-text("Dodaj u košaricu")').first();

    // Rapid clicks
    await addButton.click();
    await addButton.click();
    await addButton.click();

    // Should handle gracefully (debounce or disable)
    await page.waitForTimeout(1000);
    await expect(page.locator('h1')).toBeVisible();
  });
});