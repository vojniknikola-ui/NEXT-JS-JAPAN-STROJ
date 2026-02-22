import { test, expect } from '@playwright/test';

type CartStateItem = {
  quantity: number;
  part: Record<string, unknown>;
};

const seededCartForResponsive: CartStateItem[] = [
  {
    quantity: 1,
    part: {
      id: 303,
      name: 'Responsive dio',
      brand: 'TestBrand',
      model: 'TB-3',
      catalogNumber: 'SEED-303',
      application: 'Test',
      delivery: 'available',
      priceWithoutVAT: 75,
      priceWithVAT: 87.75,
      discount: 0,
      imageUrl: '',
      technicalSpecs: {
        spec1: '',
        spec2: '',
        spec3: '',
        spec4: '',
        spec5: '',
        spec6: '',
        spec7: '',
      },
      stock: 3,
    },
  },
];

test.describe('Responsive Design Tests', () => {
  test.beforeEach(async ({ page }) => {
    let cartState: CartStateItem[] = [];

    await page.route('**/api/cart', async (route) => {
      const method = route.request().method();

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(cartState),
        });
        return;
      }

      if (method === 'POST') {
        const rawBody = route.request().postData() ?? '[]';
        try {
          cartState = JSON.parse(rawBody) as CartStateItem[];
        } catch {
          cartState = [];
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
        return;
      }

      if (method === 'DELETE') {
        cartState = [];
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
        return;
      }

      await route.continue();
    });
  });

  test('shows mobile bottom navigation on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    await expect(page.getByTestId('nav-home-mobile')).toBeVisible();
    await expect(page.getByTestId('nav-home')).toBeHidden();
  });

  test('shows desktop navigation on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    await expect(page.getByTestId('nav-home')).toBeVisible();
    await expect(page.getByTestId('nav-home-mobile')).toBeHidden();
  });

  test('keeps responsive catalog grid classes', async ({ page }) => {
    await page.goto('/catalog');
    const className = await page.getByTestId('catalog-grid').getAttribute('class');

    expect(className ?? '').toContain('grid-cols-1');
    expect(className ?? '').toContain('sm:grid-cols-2');
    expect(className ?? '').toContain('lg:grid-cols-3');
  });

  test('opens and closes filter drawer on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/catalog');

    await page.getByTestId('catalog-mobile-filters-open').click();
    await expect(page.getByTestId('catalog-mobile-filters-close')).toBeVisible();

    await page.getByTestId('catalog-mobile-filters-close').click();
    await expect(page.getByTestId('catalog-mobile-filters-open')).toBeVisible();
  });

  test('renders cart layout correctly on mobile', async ({ page }) => {
    await page.unroute('**/api/cart');
    await page.route('**/api/cart', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(seededCartForResponsive),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/cart');

    await expect(page.getByTestId('cart-title')).toBeVisible();
    await expect(page.getByTestId('cart-item').first()).toBeVisible();
  });

  test('prevents horizontal overflow on mobile catalog', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/catalog');

    const [bodyScrollWidth, windowWidth] = await Promise.all([
      page.evaluate(() => document.body.scrollWidth),
      page.evaluate(() => window.innerWidth),
    ]);

    expect(bodyScrollWidth).toBeLessThanOrEqual(windowWidth + 8);
  });
});
