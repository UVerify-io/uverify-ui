import { test, expect } from '@playwright/test';
import { CertificatePage } from '../pages/certificatePage';
import { setupCommonMocks } from '../helpers/routeMocks';

const KNOWN_HASH =
  'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e';
const KNOWN_TX_HASH =
  '183934aa185b14c47e0dc4af34928ecf44e88d21e7248175ad357fef2e25a7ee';
const KNOWN_ISSUER =
  'addr1vx5sntqjtgyxqhxrgk9tusxn4d4l779p6vupgnhcw8qng5s9vk2c6';

const MOCK_CERTIFICATE = [
  {
    hash: KNOWN_HASH,
    address: 'a909ac125a08605cc3458abe40d3ab6bff78a1d338144ef871c13452',
    slot: 153440386,
    metadata:
      '{"comment":"This is the first UVerify mainnet certificate","message":"Thanks to my wife Caro for all her support and for blessing me with our three kids"}',
    issuer: KNOWN_ISSUER,
    blockHash:
      '448e1a2309700198fb14e2cc21c3335718dd36d40def16bb3ab9f592a8e52be9',
    blockNumber: 11753105,
    transactionHash: KNOWN_TX_HASH,
    creationTime: 1745006677000,
  },
];

test.describe('Certificate Tests', () => {
  let certificatePage: CertificatePage;

  test.beforeEach(async ({ page }) => {
    certificatePage = new CertificatePage(page);

    await setupCommonMocks(page);

    await page.route(
      `**/api/v1/verify/${KNOWN_HASH}`,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_CERTIFICATE),
        });
      },
    );

    await certificatePage.navigateToCertificatePage();
  });

  test('Certificate page is visible and certificate is valid', async () => {
    await certificatePage.isCertificateVaild();
  });

  test('Certificate metadata keys and values are displayed', async ({
    page,
  }) => {
    await expect(page.locator('input[value="comment"]')).toBeVisible();
    await expect(
      page.locator(
        'input[value="This is the first UVerify mainnet certificate"]',
      ),
    ).toBeVisible();
    await expect(page.locator('input[value="message"]')).toBeVisible();
  });

  test('Block explorer link points to the correct transaction on cexplorer.io', async ({
    page,
  }) => {
    const link = page.getByTestId('block-explorer-link');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', new RegExp(KNOWN_TX_HASH));
    await expect(link).toHaveAttribute('href', new RegExp('cexplorer\\.io'));
  });

  test('Block explorer link opens in a new tab', async ({ page }) => {
    await expect(page.getByTestId('block-explorer-link')).toHaveAttribute(
      'target',
      '_blank',
    );
  });

  test('issuer address is displayed on the certificate', async ({ page }) => {
    await expect(
      page.getByText(KNOWN_ISSUER, { exact: false }),
    ).toBeVisible();
  });
});

test.describe('Certificate Error States', () => {
  const NOT_FOUND_HASH =
    '0000000000000000000000000000000000000000000000000000000000000000';
  const SERVER_ERROR_HASH =
    'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

  test.beforeEach(async ({ page }) => {
    await setupCommonMocks(page);
  });

  test('unknown hash shows "Be Careful!" warning headline', async ({
    page,
  }) => {
    await page.route(`**/api/v1/verify/${NOT_FOUND_HASH}`, async (route) => {
      await route.fulfill({ status: 404, body: '' });
    });

    await page.goto(`/verify/${NOT_FOUND_HASH}/1`, {
      waitUntil: 'networkidle',
    });

    await expect(page.getByTestId('certificate-headline')).toContainText(
      'Be Careful! Unknown Data Ahead!',
      { timeout: 5000 },
    );
  });

  test('server error shows "UVerify Service is Currently Unavailable"', async ({
    page,
  }) => {
    await page.route(
      `**/api/v1/verify/${SERVER_ERROR_HASH}`,
      async (route) => {
        await route.fulfill({ status: 500, body: 'Internal Server Error' });
      },
    );

    await page.goto(`/verify/${SERVER_ERROR_HASH}/1`, {
      waitUntil: 'networkidle',
    });

    await expect(page.getByTestId('certificate-headline')).toContainText(
      'UVerify Service is Currently Unavailable',
      { timeout: 5000 },
    );
  });
});
