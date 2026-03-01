import { Page } from '@playwright/test';

export const setupCommonMocks = async (page: Page) => {
  await page.route('**/config.json', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        backendUrl: 'http://localhost:9090',
        cardanoNetwork: 'mainnet',
      }),
    });
  });

  await page.route(
    '**//matomo.battlechoc.com:8181/matomo.js',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/javascript',
        body: 'console.log("Matomo script loaded");',
      });
    },
  );
};
