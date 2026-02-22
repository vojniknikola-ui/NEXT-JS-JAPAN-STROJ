import { test, expect } from '@playwright/test';

test.describe('Catalog Filtering and Search Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalog');
    await expect(page.getByTestId('catalog-title')).toBeVisible();
  });

  test('searches products and updates grid', async ({ page }) => {
    const cards = page.getByTestId('product-card');
    await expect(cards.first()).toBeVisible();
    const initialCount = await cards.count();

    await page.getByTestId('catalog-search').fill('motor');
    await page.waitForTimeout(400);

    const filteredCount = await cards.count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('shows no-results message for unmatched query', async ({ page }) => {
    await page.getByTestId('catalog-search').fill('nonexistentproduct12345');
    await expect(page.getByText('Nema rezultata')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Prikaži sve dijelove' })).toBeVisible();
  });

  test('clears active filters and search', async ({ page }) => {
    await page.getByTestId('catalog-search').fill('pump');
    await expect(page.getByTestId('catalog-clear-filters')).toBeVisible();

    await page.getByTestId('catalog-clear-filters').click();
    await expect(page.getByTestId('catalog-search')).toHaveValue('');
  });

  test('changes sort mode', async ({ page }) => {
    const sort = page.locator('#catalog-sort');
    await sort.selectOption('price_asc');
    await expect(sort).toHaveValue('price_asc');

    await sort.selectOption('price_desc');
    await expect(sort).toHaveValue('price_desc');
  });

  test('opens and closes mobile filters panel', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/catalog');

    await page.getByTestId('catalog-mobile-filters-open').click();
    await expect(page.getByTestId('catalog-mobile-filters-close')).toBeVisible();

    await page.getByTestId('catalog-mobile-filters-close').click();
    await expect(page.getByTestId('catalog-mobile-filters-open')).toBeVisible();
  });

  test('opens product details from catalog card', async ({ page }) => {
    await expect(page.getByTestId('product-card').first()).toBeVisible();
    const href = await page.getByTestId('product-card-open').first().getAttribute('href');
    expect(href).toMatch(/^\/product\/\d+$/);
    await page.goto(href!);

    await expect(page).toHaveURL(/\/product\/\d+$/);
    await expect(page.getByTestId('product-add-to-cart')).toBeVisible();
  });
});
