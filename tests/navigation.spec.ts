import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test('exposes correct desktop navigation routes', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    await expect(page.getByTestId('hero-title')).toBeVisible();
    await expect(page.getByTestId('nav-catalog')).toHaveAttribute('href', '/catalog');
    await expect(page.getByTestId('nav-services')).toHaveAttribute('href', '/services');
    await expect(page.getByTestId('nav-manuals')).toHaveAttribute('href', '/manuals');
    await expect(page.getByTestId('nav-cart')).toHaveAttribute('href', '/cart');
  });

  test('exposes correct mobile navigation routes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    await expect(page.getByTestId('nav-home-mobile')).toHaveAttribute('href', '/');
    await expect(page.getByTestId('nav-catalog-mobile')).toHaveAttribute('href', '/catalog');
    await expect(page.getByTestId('nav-services-mobile')).toHaveAttribute('href', '/services');
    await expect(page.getByTestId('nav-cart-mobile')).toHaveAttribute('href', '/cart');
    await expect(page.getByTestId('nav-manuals-mobile')).toHaveAttribute('href', '/manuals');
  });

  test('opens product page using catalog link href', async ({ page }) => {
    await page.goto('/catalog');
    await expect(page.getByTestId('product-card-open').first()).toBeVisible({ timeout: 15000 });

    const href = await page.getByTestId('product-card-open').first().getAttribute('href');
    expect(href).toMatch(/^\/product\/\d+$/);

    await page.goto(href!);
    await expect(page).toHaveURL(/\/product\/\d+$/);
    await expect(page.getByTestId('product-add-to-cart')).toBeVisible();
  });

  test('shows fallback UI for invalid product route', async ({ page }) => {
    await page.goto('/product/999999999');
    await expect(page.getByRole('heading', { name: 'Proizvod nije pronađen' })).toBeVisible();
  });
});
