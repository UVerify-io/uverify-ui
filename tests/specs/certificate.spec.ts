import { test, expect } from '@playwright/test';
import { CertificatePage } from '../pages/certificatePage';

test.describe('Certificate Tests', () => {
  let certificatePage: CertificatePage;

  test.beforeEach(async ({ page }) => {
    certificatePage = new CertificatePage(page);

    await page.route(
      '**/api/v1/verify/a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
              address:
                'a909ac125a08605cc3458abe40d3ab6bff78a1d338144ef871c13452',
              slot: 153440386,
              metadata:
                '{"comment":"This is the first UVerify mainnet certificate","message":"Thanks to my wife Caro for all her support and for blessing me with our three kids"}',
              issuer:
                'addr1vx5sntqjtgyxqhxrgk9tusxn4d4l779p6vupgnhcw8qng5s9vk2c6',
              block_hash:
                '448e1a2309700198fb14e2cc21c3335718dd36d40def16bb3ab9f592a8e52be9',
              block_number: 11753105,
              transaction_hash:
                '183934aa185b14c47e0dc4af34928ecf44e88d21e7248175ad357fef2e25a7ee',
              creation_time: 1745006677000,
            },
          ]),
        });
      }
    );

    await certificatePage.navigateToCertificatePage();
  });

  test('Certificate page is visible and certificate is valid', async ({
    page,
  }) => {
    await certificatePage.isCertificateVaild();
  });
});
