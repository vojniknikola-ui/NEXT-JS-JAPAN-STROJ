import { test, expect } from '@playwright/test';

const mockCartItems = [
  {
    quantity: 1,
    part: {
      id: 101,
      name: 'Smoke dio',
      brand: 'TestBrand',
      model: 'TB-1',
      catalogNumber: 'SM-101',
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

test.describe('Smoke Flows', () => {
  test.beforeEach(({ browserName }) => {
    test.skip(browserName !== 'chromium', 'Smoke testovi se izvršavaju na Chromium projektu.');
  });

  test('admin add part flow', async ({ page }) => {
    let postedPayload: Record<string, unknown> | null = null;

    await page.route('**/api/admin/session', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            authenticated: true,
            role: 'admin',
            roleLabel: 'Admin',
            permissions: { canRead: true, canEdit: true, canDelete: true },
          }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.route('**/api/invoices**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          page: 1,
          pageSize: 20,
          total: 0,
          hasMore: false,
        }),
      });
    });

    await page.route('**/api/categories', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 1, name: 'Hidraulika', slug: 'hidraulika' }]),
      });
    });

    await page.route('**/api/parts**', async (route) => {
      const method = route.request().method();

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: [], nextCursor: null, hasMore: false }),
        });
        return;
      }

      if (method === 'POST') {
        postedPayload = route.request().postDataJSON() as Record<string, unknown>;
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 999 }),
        });
        return;
      }

      await route.continue();
    });

    await page.goto('/admin');

    await page.fill('#part-sku', 'smoke 001');
    await page.fill('#part-title', 'Smoke test dio');
    await page.fill('#part-price', '100');
    await page.fill('#part-currency', 'bam');

    await page.getByTestId('admin-save-button').click();

    await expect(page.getByTestId('app-toast').last()).toContainText('Dio je uspješno dodan.');
    expect(postedPayload).not.toBeNull();
    expect(postedPayload?.sku).toBe('SMOKE-001');
    expect(postedPayload?.currency).toBe('BAM');
  });

  test('cart smoke flow', async ({ page }) => {
    await page.route('**/api/cart', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockCartItems),
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
    await expect(page.getByRole('heading', { name: /^Košarica$/ })).toBeVisible();
    await expect(page.getByTestId('cart-item')).toHaveCount(1);
    await expect(page.getByTestId('cart-qty-101')).toHaveText('1');
    await page.getByTestId('cart-increase-101').click();
    await expect(page.getByTestId('cart-qty-101')).toHaveText('2');
  });

  test('proforma pdf download flow', async ({ page }) => {
    const fakePdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');

    await page.route('**/api/cart', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockCartItems),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.route('**/api/generate-invoice', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'X-Invoice-Number': 'PR-SMOKE-0001',
          'Content-Disposition': 'attachment; filename="predracun-PR-SMOKE-0001.pdf"',
        },
        body: fakePdf,
      });
    });

    await page.goto('/cart');
    await page.getByTestId('open-proforma-modal').click();

    await page.fill('#invoice-company-name', 'Čekić d.o.o.');
    await page.fill('#invoice-id-number', '123456789');
    await page.fill('#invoice-pdv-number', '987654321');
    await page.fill('#invoice-contact-name', 'Šaban Žurić');
    await page.fill('#invoice-company-address', 'Ćuprija 12, Živinice');
    await page.fill('#invoice-contact-phone', '+38761123456');

    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('generate-proforma-button').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('predracun-PR-SMOKE-0001.pdf');
    await expect(page.getByTestId('app-toast').last()).toContainText('Predračun je spreman');
  });
});
