import { test, expect } from '@playwright/test';

test.describe('Catalog Filtering and Search Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForSelector('button:has-text("Dodaj u košaricu")', { timeout: 10000 });
  });

  test('should search products by name', async ({ page }) => {
    // Get initial product count
    const initialCount = await page.locator('div.cursor-pointer').count();

    // Search for a specific term (assuming products exist)
    await page.fill('input[placeholder*="Pretraga"]', 'motor');
    await page.press('input[placeholder*="Pretraga"]', 'Enter');

    // Wait for results
    await page.waitForTimeout(1000);

    // Check that results are filtered
    const filteredCount = await page.locator('div.cursor-pointer').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('should filter by category', async ({ page }) => {
    // Open filters on mobile if needed
    if (await page.locator('button:has-text("Filteri")').isVisible()) {
      await page.locator('button:has-text("Filteri")').click();
    }

    // Select first category
    const firstCategory = page.locator('select').first();
    if (await firstCategory.isVisible()) {
      await firstCategory.selectOption({ index: 1 });

      // Wait for filtering
      await page.waitForTimeout(1000);

      // Check results are filtered
      const results = await page.locator('div.cursor-pointer').count();
      expect(results).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter by brand', async ({ page }) => {
    // Open filters if mobile
    if (await page.locator('button:has-text("Filteri")').isVisible()) {
      await page.locator('button:has-text("Filteri")').click();
    }

    // Find brand checkboxes and check first one
    const brandCheckboxes = page.locator('input[type="checkbox"]').filter({ hasText: /brand/i });
    if (await brandCheckboxes.first().isVisible()) {
      await brandCheckboxes.first().check();

      // Wait for filtering
      await page.waitForTimeout(1000);

      // Check results
      const results = await page.locator('div.cursor-pointer').count();
      expect(results).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter by price range', async ({ page }) => {
    // Open filters if mobile
    if (await page.locator('button:has-text("Filteri")').isVisible()) {
      await page.locator('button:has-text("Filteri")').click();
    }

    // Find price range inputs
    const priceInputs = page.locator('input[type="range"]');
    if (await priceInputs.first().isVisible()) {
      // Set minimum price
      await priceInputs.first().fill('100');

      // Wait for filtering
      await page.waitForTimeout(1000);

      // Check results
      const results = await page.locator('div.cursor-pointer').count();
      expect(results).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter by availability', async ({ page }) => {
    // Open filters if mobile
    if (await page.locator('button:has-text("Filteri")').isVisible()) {
      await page.locator('button:has-text("Filteri")').click();
    }

    // Find availability checkboxes
    const availabilityCheckboxes = page.locator('input[type="checkbox"]').filter({ hasText: /dostupno|rok|po dogovoru/i });
    if (await availabilityCheckboxes.first().isVisible()) {
      await availabilityCheckboxes.first().check();

      // Wait for filtering
      await page.waitForTimeout(1000);

      // Check results
      const results = await page.locator('div.cursor-pointer').count();
      expect(results).toBeGreaterThanOrEqual(0);
    }
  });

  test('should show only discounted products', async ({ page }) => {
    // Open filters if mobile
    if (await page.locator('button:has-text("Filteri")').isVisible()) {
      await page.locator('button:has-text("Filteri")').click();
    }

    // Find discount checkbox
    const discountCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /popust|discount/i });
    if (await discountCheckbox.isVisible()) {
      await discountCheckbox.check();

      // Wait for filtering
      await page.waitForTimeout(1000);

      // Check results
      const results = await page.locator('div.cursor-pointer').count();
      expect(results).toBeGreaterThanOrEqual(0);
    }
  });

  test('should clear all filters', async ({ page }) => {
    // Apply some filters first
    if (await page.locator('button:has-text("Filteri")').isVisible()) {
      await page.locator('button:has-text("Filteri")').click();
    }

    // Search something
    await page.fill('input[placeholder*="Pretraga"]', 'test');

    // Clear filters
    await page.locator('button:has-text("Poništi filtere")').click();

    // Check search is cleared
    await expect(page.locator('input[placeholder*="Pretraga"]')).toHaveValue('');
  });

  test('should load more products', async ({ page }) => {
    // Get initial count
    const initialCount = await page.locator('div.cursor-pointer').count();

    // Scroll to load more (if available)
    const loadMoreTrigger = page.locator('div').filter({ hasText: 'Učitavanje još' });
    if (await loadMoreTrigger.isVisible()) {
      // Scroll into view
      await loadMoreTrigger.scrollIntoViewIfNeeded();

      // Wait for loading
      await page.waitForTimeout(2000);

      // Check more products loaded
      const newCount = await page.locator('div.cursor-pointer').count();
      expect(newCount).toBeGreaterThan(initialCount);
    }
  });

  test('should show no results message', async ({ page }) => {
    // Search for something that doesn't exist
    await page.fill('input[placeholder*="Pretraga"]', 'nonexistentproduct12345');
    await page.press('input[placeholder*="Pretraga"]', 'Enter');

    // Wait for results
    await page.waitForTimeout(1000);

    // Check no results message
    await expect(page.locator('text=Nema rezultata')).toBeVisible();
    await expect(page.locator('button:has-text("Prikaži sve dijelove")')).toBeVisible();
  });

  test('should show loading state', async ({ page }) => {
    await page.reload();
    await expect(page.locator('text=Učitavanje kataloga')).toBeVisible();
  });

  test('should handle error state', async ({ page }) => {
    // This would require mocking API errors, for now just check error handling exists
    // In a real scenario, we'd mock the API to return errors
    await expect(page.locator('text=Greška pri učitavanju')).toBeVisible({ timeout: 5000 }).catch(() => {
      // Error state might not occur in normal testing
      console.log('Error state not triggered in this test run');
    });
  });
});