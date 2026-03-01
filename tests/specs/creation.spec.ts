import { test, expect } from '@playwright/test';
import { CreationPage } from '../pages/creationPage';
import { setupCommonMocks } from '../helpers/routeMocks';

test.describe('Creation Page', () => {
  let creationPage: CreationPage;

  test.beforeEach(async ({ page }) => {
    creationPage = new CreationPage(page);
    await setupCommonMocks(page);
    await creationPage.navigateToCreationPage();
  });

  test('shows page heading and description', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Create a Verifiable Trust Certificate' }),
    ).toBeVisible();
    await expect(
      page.getByText("Drop a file or write some plain text that you want to freeze in time."),
    ).toBeVisible();
  });

  test('Upload File and Write Text tabs are visible', async ({ page }) => {
    await expect(page.getByText('Upload File')).toBeVisible();
    await expect(page.getByText('Write Text')).toBeVisible();
  });

  test('shows Connect Wallet button when no wallet is connected', async ({
    page,
  }) => {
    await expect(
      page.getByRole('button', { name: 'Connect Wallet' }),
    ).toBeVisible();
  });

  test('clicking Connect Wallet button opens the wallet dialog', async ({
    page,
  }) => {
    await creationPage.clickConnectWalletButton();
    await expect(
      page.getByRole('heading', { name: 'Connect Wallet' }),
    ).toBeVisible();
  });

  test('wallet dialog explains why wallet connection is required', async ({
    page,
  }) => {
    await creationPage.clickConnectWalletButton();
    await expect(
      page.getByText('Why do I need to connect with my wallet?'),
    ).toBeVisible();
  });

  test('typing text in Write Text tab reveals fingerprint', async ({ page }) => {
    await creationPage.switchToWriteTextTab();
    await creationPage.enterText('Hello World');
    await expect(page.getByTestId('fingerprint')).toBeVisible();
  });

  test('Certificate Template selector appears after entering text', async ({
    page,
  }) => {
    await creationPage.switchToWriteTextTab();
    await creationPage.enterText('Hello World');
    await expect(page.getByText('Certificate Template')).toBeVisible();
  });
});
