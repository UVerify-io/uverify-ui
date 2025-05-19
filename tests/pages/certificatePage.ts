import { expect, Page } from '@playwright/test';

export class CertificatePage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToCertificatePage() {
    await this.page.goto(
      '/verify/a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e/1'
    );
  }

  async isCertificateVaild() {
    await expect(
      await this.page.getByTestId('certificate-headline')
    ).toContainText('You Can Trust the Issuer!');
  }
}
