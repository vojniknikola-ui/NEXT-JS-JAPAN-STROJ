import { test, expect, type Page } from '@playwright/test';

type CartStateItem = {
  quantity: number;
  part: Record<string, unknown>;
};

const seededCartForModal: CartStateItem[] = [
  {
    quantity: 1,
    part: {
      id: 101,
      name: 'Seeded dio',
      brand: 'TestBrand',
      model: 'TB-1',
      catalogNumber: 'SEED-101',
      application: 'Test',
      delivery: 'available',
      priceWithoutVAT: 85.47,
      priceWithVAT: 100,
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
      stock: 2,
    },
  },
];

async function addFirstCatalogItem(page: Page) {
  await page.goto('/catalog');
  await expect(page.getByTestId('product-card').first()).toBeVisible();
  await page.locator('button:has-text("Dodaj u košaricu")').first().click();
  await expect(page.getByTestId('app-toast').last()).toContainText('Dodano u košaricu');
}

async function openCartFromHeader(page: Page) {
  await page.goto('/cart');
  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.getByTestId('cart-title')).toBeVisible();
}

test.describe('Cart Operations Tests', () => {
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

  test('adds item to cart from catalog', async ({ page }) => {
    await page.goto('/catalog');
    await expect(page.getByTestId('product-card').first()).toBeVisible();

    const initialCount = Number.parseInt((await page.getByTestId('cart-count').textContent()) ?? '0', 10);

    await page.locator('button:has-text("Dodaj u košaricu")').first().click();
    await expect(page.getByTestId('app-toast').last()).toContainText('Dodano u košaricu');

    const newCount = Number.parseInt((await page.getByTestId('cart-count').textContent()) ?? '0', 10);
    expect(newCount).toBe(initialCount + 1);
  });

  test('adds item to cart from product detail page', async ({ page }) => {
    await page.goto('/catalog');
    const href = await page.getByTestId('product-card-open').first().getAttribute('href');
    expect(href).toMatch(/^\/product\/\d+$/);
    await page.goto(href!);

    const initialCount = Number.parseInt((await page.getByTestId('cart-count').textContent()) ?? '0', 10);

    await expect(page).toHaveURL(/\/product\/\d+$/);
    await page.getByTestId('product-add-to-cart').click();
    await expect(page.getByTestId('app-toast').last()).toContainText('Dodano u košaricu');
    await expect(page.getByTestId('cart-count')).toHaveText(String(initialCount + 1));
  });

  test('updates quantity using plus/minus controls', async ({ page }) => {
    await addFirstCatalogItem(page);
    await openCartFromHeader(page);

    const qty = page.locator('[data-testid^="cart-qty-"]').first();
    const increase = page.locator('[data-testid^="cart-increase-"]').first();
    const decrease = page.locator('[data-testid^="cart-decrease-"]').first();

    await expect(qty).toHaveText('1');
    await increase.click();
    await expect(qty).toHaveText('2');
    await decrease.click();
    await expect(qty).toHaveText('1');
  });

  test('removes item from cart and shows empty state', async ({ page }) => {
    await addFirstCatalogItem(page);
    await openCartFromHeader(page);

    await page.locator('[data-testid^="cart-remove-"]').first().click();
    await expect(page.getByRole('heading', { name: 'Košarica je prazna' })).toBeVisible();
  });

  test('clears entire cart through confirm dialog', async ({ page }) => {
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
    await expect(page.getByTestId('cart-item')).toHaveCount(1);
    await page.getByRole('button', { name: 'Isprazni košaricu' }).click();
    await page.getByRole('button', { name: 'Isprazni', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'Košarica je prazna' })).toBeVisible();
  });

  test('opens proforma modal from cart', async ({ page }) => {
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

    await page.getByTestId('generate-proforma-button').click();
    await expect(page.getByText('Popunite sva obavezna polja prije generisanja predračuna.')).toBeVisible();
  });
});
