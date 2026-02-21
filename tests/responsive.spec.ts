import { test, expect } from '@playwright/test';

test.describe('Responsive Design Tests', () => {
  test('should display mobile navigation on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Check mobile menu button is visible
    await expect(page.locator('button[aria-label="Toggle mobile menu"]')).toBeVisible();

    // Desktop navigation should be hidden
    await expect(page.locator('nav.hidden.lg\\:flex')).toBeHidden();
  });

  test('should display desktop navigation on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });

    await page.goto('/');

    // Desktop navigation should be visible
    await expect(page.locator('nav.hidden.lg\\:flex')).toBeVisible();

    // Mobile menu button should be hidden
    await expect(page.locator('button[aria-label="Toggle mobile menu"]')).toBeHidden();
  });

  test('should adapt catalog layout for different screen sizes', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForSelector('button:has-text("Dodaj u košaricu")', { timeout: 10000 });

    // Mobile layout (1 column)
    await page.setViewportSize({ width: 375, height: 667 });
    let gridCols = await page.locator('.grid').first().getAttribute('class');
    expect(gridCols).toContain('grid-cols-1');

    // Tablet layout (2 columns)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForSelector('button:has-text("Dodaj u košaricu")', { timeout: 10000 });
    gridCols = await page.locator('.grid').first().getAttribute('class');
    expect(gridCols).toContain('sm:grid-cols-2');

    // Desktop layout (3-4 columns)
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();
    await page.waitForSelector('button:has-text("Dodaj u košaricu")', { timeout: 10000 });
    gridCols = await page.locator('.grid').first().getAttribute('class');
    expect(gridCols).toContain('lg:grid-cols-3');
  });

  test('should show mobile filters on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/catalog');

    // Mobile filter button should be visible
    await expect(page.locator('button:has-text("Filteri")')).toBeVisible();

    // Desktop filter panel should be hidden
    await expect(page.locator('.hidden.lg\\:block')).toBeHidden();
  });

  test('should show desktop filters on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });

    await page.goto('/catalog');

    // Desktop filter panel should be visible
    await expect(page.locator('.hidden.lg\\:block')).toBeVisible();

    // Mobile filter button should be hidden
    await expect(page.locator('button:has-text("Filteri")')).toBeHidden();
  });

  test('should adapt cart layout for mobile', async ({ page }) => {
    // Add item to cart first
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/catalog');
    await page.waitForSelector('button:has-text("Dodaj u košaricu")', { timeout: 10000 });
    await page.locator('button:has-text("Dodaj u košaricu")').first().click();

    // Go to cart
    await page.locator('a[href="/cart"]').first().click();

    // Switch to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.goto('/cart');

    // Check mobile cart layout
    await expect(page.locator('.flex-col.sm\\:flex-row')).toBeVisible();
  });

  test('should adapt product detail layout for mobile', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForSelector('button:has-text("Dodaj u košaricu")', { timeout: 10000 });
    const firstProduct = page.locator('div.cursor-pointer').first();
    await firstProduct.click();

    // Mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.goto('/product/1'); // Assuming product exists

    // Check mobile product layout
    await expect(page.locator('.grid.grid-cols-1.lg\\:grid-cols-2')).toBeVisible();
  });

  test('should handle touch interactions on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/catalog');

    // Touch interactions should work
    await page.locator('button:has-text("Dodaj u košaricu")').first().tap();
    await expect(page.locator('text=dodan u košaricu')).toBeVisible();
  });

  test('should display appropriate font sizes for different screens', async ({ page }) => {
    await page.goto('/');

    // Check responsive text sizes
    const heroTitle = page.locator('h1').filter({ hasText: 'JapanStroj' });
    const className = await heroTitle.getAttribute('class');

    // Should have responsive classes
    expect(className).toContain('text-3xl');
    expect(className).toContain('sm:text-4xl');
    expect(className).toContain('md:text-6xl');
  });

  test('should adapt header layout for different screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Mobile header
    await expect(page.locator('.flex.items-center.justify-between.h-14')).toBeVisible();

    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();
    await page.goto('/');

    // Desktop header
    await expect(page.locator('.flex.items-center.justify-between.h-20')).toBeVisible();
  });

  test('should handle horizontal scrolling prevention', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/catalog');

    // Content should not cause horizontal scrolling
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);

    expect(bodyScrollWidth).toBeLessThanOrEqual(windowWidth + 10); // Allow small margin
  });
});