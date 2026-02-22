import { test, expect } from '@playwright/test';

type CartStateItem = {
  quantity: number;
  part: Record<string, unknown>;
};

const seededCartForModal: CartStateItem[] = [
  {
    quantity: 1,
    part: {
      id: 202,
      name: 'Modal test dio',
      brand: 'TestBrand',
      model: 'TB-2',
      catalogNumber: 'SEED-202',
      application: 'Test',
      delivery: 'available',
      priceWithoutVAT: 90,
      priceWithVAT: 105.3,
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
      stock: 5,
    },
  },
];

test.describe('User Interactions Tests', () => {
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

  test('supports keyboard Enter on featured product cards', async ({ page }) => {
    await page.goto('/');
    const firstFeatured = page.getByTestId('home-featured-card').first();

    await expect(firstFeatured).toBeVisible();
    await firstFeatured.focus();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/product\/\d+$/);
  });

  test('keeps focus on catalog search while typing', async ({ page }) => {
    await page.goto('/catalog');
    const search = page.getByTestId('catalog-search');

    await search.focus();
    await page.keyboard.type('test upit');

    await expect(search).toHaveValue('test upit');
    const activeTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeTag).toBe('INPUT');
  });

  test('keeps sticky header visible during scroll', async ({ page }) => {
    await page.goto('/');
    await page.mouse.wheel(0, 1200);
    await expect(page.locator('header')).toBeVisible();

    await page.mouse.wheel(0, -1200);
    await expect(page.getByTestId('hero-title')).toBeVisible();
  });

  test('adapts navigation when viewport changes', async ({ page }) => {
    await page.goto('/');

    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.getByTestId('nav-home-mobile')).toBeVisible();

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.getByTestId('nav-home')).toBeVisible();
  });

  test('handles proforma modal open and cancel actions', async ({ page }) => {
    await page.unroute('**/api/cart');
    await page.route('**/api/cart', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(seededCartForModal),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });
    await page.goto('/cart');
    await expect(page.getByTestId('open-proforma-modal')).toBeVisible();
    await page.getByTestId('open-proforma-modal').click();
    await expect(page.getByRole('heading', { name: 'Generiši predračun' })).toBeVisible();

    await page.getByRole('button', { name: 'Odustani' }).click();
    await expect(page.getByRole('heading', { name: 'Generiši predračun' })).toBeHidden();
  });

  test('handles rapid search input changes without UI break', async ({ page }) => {
    await page.goto('/catalog');
    const search = page.getByTestId('catalog-search');

    await search.fill('motor');
    await search.fill('pump');
    await search.fill('filter');
    await search.fill('');

    await expect(page.getByTestId('catalog-title')).toBeVisible();
  });
});
