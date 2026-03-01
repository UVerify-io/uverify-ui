import { test, expect } from '@playwright/test';
import { VerificationPage } from '../pages/verificationPage';
import { setupCommonMocks } from '../helpers/routeMocks';

// sha256("Hello World") — used to assert navigation after Verify
const HELLO_WORLD_HASH =
  'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e';

test.describe('Verification Page', () => {
  let verificationPage: VerificationPage;

  test.beforeEach(async ({ page }) => {
    verificationPage = new VerificationPage(page);
    await setupCommonMocks(page);
    await verificationPage.navigateToVerificationPage();
  });

  test('shows page heading and description', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: "Let's check the data fridge" }),
    ).toBeVisible();
    await expect(
      page.getByText(
        'Drop a file or enter some plain text to check if someone has submitted the same data before',
      ),
    ).toBeVisible();
  });

  test('Upload File and Write Text tabs are visible', async ({ page }) => {
    await expect(page.getByText('Upload File')).toBeVisible();
    await expect(page.getByText('Write Text')).toBeVisible();
  });

  test('Dropzone is shown on Upload File tab by default', async ({ page }) => {
    await expect(
      page.getByText('Click to upload'),
    ).toBeVisible();
  });

  test('typing text in Write Text tab reveals fingerprint', async ({
    page,
  }) => {
    await verificationPage.switchToWriteTextTab();
    await verificationPage.enterText('Hello World');
    await expect(page.getByTestId('fingerprint')).toBeVisible();
  });

  test('clicking Verify with text navigates to the correct hash URL', async ({
    page,
  }) => {
    await verificationPage.switchToWriteTextTab();
    await verificationPage.enterText('Hello World');
    await verificationPage.clickVerifyButton();
    await expect(page).toHaveURL(new RegExp(HELLO_WORLD_HASH));
  });

  test('clicking Verify without content shows an info toast', async ({
    page,
  }) => {
    await verificationPage.switchToWriteTextTab();
    await verificationPage.clickVerifyButton();
    await expect(page.getByText('Please enter some text')).toBeVisible();
  });

  test('clicking Verify on Upload File tab without a file shows an info toast', async ({
    page,
  }) => {
    // Upload File tab is active by default
    await verificationPage.clickVerifyButton();
    await expect(page.getByText('Please upload a file')).toBeVisible();
  });
});

test.describe('Verification ?message= redirect', () => {
  test('?message= query parameter auto-redirects to the hash-based URL', async ({
    page,
  }) => {
    await setupCommonMocks(page);
    // Mock the certificate API so the Certificate page can load cleanly
    await page.route(
      `**/api/v1/verify/${HELLO_WORLD_HASH}`,
      async (route) => {
        await route.fulfill({
          status: 404,
          body: '',
        });
      },
    );

    await page.goto(`/verify?message=Hello%20World`);
    await page.waitForURL(new RegExp(HELLO_WORLD_HASH), { timeout: 5000 });
    await expect(page).toHaveURL(new RegExp(HELLO_WORLD_HASH));
  });
});
