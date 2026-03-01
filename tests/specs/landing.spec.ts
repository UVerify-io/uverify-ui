import { test, expect } from '@playwright/test';
import { LandingPage } from '../pages/landingPage';

test.describe('Landing Tests', () => {
  let landingPage: LandingPage;

  test.beforeEach(async ({ page }) => {
    landingPage = new LandingPage(page);
    await landingPage.navigateToLandingPage();
  });

  test('Verify button navigates to /verify', async ({ page }) => {
    await landingPage.clickVerifyButton();
    await expect(
      page.getByRole('banner').getByRole('heading', { name: 'Verify Data' })
    ).toBeVisible();
  });

  test('Create button navigates to /create', async ({ page }) => {
    await landingPage.clickCreateButton();
    await expect(
      page.getByRole('heading', { name: 'Create Verifiable Data' })
    ).toBeVisible();
  });

  test('Footer is visible', async () => {
    await landingPage.isFooterVisible();
  });

  test('Footer Terms of Use link points to the correct URL', async ({
    page,
  }) => {
    await expect(page.getByTestId('terms-of-use-link')).toHaveAttribute(
      'href',
      'https://uverify.io/terms-of-use',
    );
  });

  test('Footer Privacy Policy link points to the correct URL', async ({
    page,
  }) => {
    await expect(page.getByTestId('privacy-policy-link')).toHaveAttribute(
      'href',
      'https://uverify.io/privacy-policy',
    );
  });

  test('Footer Impress link points to the correct URL', async ({ page }) => {
    await expect(page.getByTestId('impress-link')).toHaveAttribute(
      'href',
      'https://uverify.io/#impress',
    );
  });
});
