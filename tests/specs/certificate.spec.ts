import { test, expect } from '@playwright/test';
import { CertificatePage } from '../pages/certificatePage';
import { setupCommonMocks } from '../helpers/routeMocks';

const SOCIAL_HUB_HASH =
  '243d719da7c49d8616723e0cfb698611b0f370f0b34a744b2e0e88b55cd86fa8';
const SOCIAL_HUB_BATCH_ID =
  '2898c9849a49f216e0c389040eda20610819c1e4b64b9d41b2137bc54f374455';
const SOCIAL_HUB_ITEM = 'testItemToken001';

const MOCK_SOCIAL_HUB_CERTIFICATE = [
  {
    hash: SOCIAL_HUB_HASH,
    address: '3f9ff01fd67fcf42cb64f004f13306bd4bfd651154aedcb0dd68dd87',
    blockHash:
      'ee6d5c3d4d36014243a1962514c4fceb5bb69c0b58ae40e72fec583c2d12c2b3',
    blockNumber: 11765294,
    transactionHash:
      '3a5ef8c0c2d0b658e35db4dd7902c26bdcc5c741d750390cece123bc4d9b6c50',
    slot: 153684421,
    creationTime: 1745250712000,
    metadata: JSON.stringify({
      batch_ids: SOCIAL_HUB_BATCH_ID,
      whitelabel: 'TEST_EVENT_2025',
      uverify_template_id: 'socialHub',
    }),
    issuer: 'addr1vyleluql6elu7sktvncqfufnq675hlt9z922ah9sm45dmpcy8332u',
  },
];

const MOCK_SOCIAL_HUB_DATA = {
  owner: 'addr1vxyl05yusa82m9r003vvrxe4f3cmp6ctqnwvrx3sh9upwls7u87cs',
  picture: null,
  name: 'Alex Example',
  subtitle: 'Software Engineer',
  x: '@alex_example',
  telegram: null,
  discord: null,
  youtube: null,
  website: null,
  email: 'alex@example.com',
  reddit: null,
  instagram: null,
  github: 'https://github.com/alex-example',
  linkedin: 'https://www.linkedin.com/in/alex-example/',
  ada_handle: '$alex_example',
  item_name: 'SHIRT000',
};

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

test.describe('SocialHub Template Tests', () => {
  const setupSocialHubMocks = async (page: Parameters<typeof setupCommonMocks>[0]) => {
    await setupCommonMocks(page);
    await page.route(
      `**/api/v1/verify/${SOCIAL_HUB_HASH}`,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_SOCIAL_HUB_CERTIFICATE),
        });
      },
    );
  };

  test('renders the SocialHub template instead of the default template', async ({
    page,
  }) => {
    await setupSocialHubMocks(page);
    await page.route(
      `**/api/v1/extension/connected-goods/${SOCIAL_HUB_BATCH_ID}/${SOCIAL_HUB_ITEM}`,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_SOCIAL_HUB_DATA),
        });
      },
    );

    await page.goto(
      `/verify/${SOCIAL_HUB_HASH}/1?item=${SOCIAL_HUB_ITEM}`,
      { waitUntil: 'networkidle' },
    );

    // The default template's headline must not appear
    await expect(page.getByTestId('certificate-headline')).not.toBeVisible();
  });

  test('displays item name and claimed profile from connected-goods data', async ({
    page,
  }) => {
    await setupSocialHubMocks(page);
    await page.route(
      `**/api/v1/extension/connected-goods/${SOCIAL_HUB_BATCH_ID}/${SOCIAL_HUB_ITEM}`,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_SOCIAL_HUB_DATA),
        });
      },
    );

    await page.goto(
      `/verify/${SOCIAL_HUB_HASH}/1?item=${SOCIAL_HUB_ITEM}`,
      { waitUntil: 'networkidle' },
    );

    await expect(page.getByText('SHIRT000')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Alex Example')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Software Engineer')).toBeVisible({
      timeout: 5000,
    });
  });

  test('shows loading indicator while connected-goods data is being fetched', async ({
    page,
  }) => {
    await setupSocialHubMocks(page);

    // Delay the connected-goods response so we can observe the loading state
    await page.route(
      `**/api/v1/extension/connected-goods/${SOCIAL_HUB_BATCH_ID}/${SOCIAL_HUB_ITEM}`,
      async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_SOCIAL_HUB_DATA),
        });
      },
    );

    await page.goto(`/verify/${SOCIAL_HUB_HASH}/1?item=${SOCIAL_HUB_ITEM}`);

    // While the connected-goods request is still pending, the loading indicator
    // should be shown and the profile content should not yet be visible
    await expect(page.getByText('Alex Example')).not.toBeVisible();
    await expect(page.getByText('SHIRT000')).not.toBeVisible();

    // After the request completes, the profile should appear
    await expect(page.getByText('SHIRT000')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Alex Example')).toBeVisible({ timeout: 5000 });
  });

  test('shows "not part of batch" error when connected-goods item is not found', async ({
    page,
  }) => {
    await setupSocialHubMocks(page);
    await page.route(
      `**/api/v1/extension/connected-goods/${SOCIAL_HUB_BATCH_ID}/${SOCIAL_HUB_ITEM}`,
      async (route) => {
        await route.fulfill({ status: 404, body: '' });
      },
    );

    await page.goto(
      `/verify/${SOCIAL_HUB_HASH}/1?item=${SOCIAL_HUB_ITEM}`,
      { waitUntil: 'networkidle' },
    );

    await expect(
      page.getByText('This item is not part of the batch or is unrecognized', {
        exact: false,
      }),
    ).toBeVisible({ timeout: 5000 });
  });
});
