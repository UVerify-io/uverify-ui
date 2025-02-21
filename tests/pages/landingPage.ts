import { Page } from '@playwright/test';

export class LandingPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToLandingPage() {
    await this.page.goto('/');
  }

  async clickVerifyButton() {
    await this.page.getByRole('button', { name: 'Verify' }).click();
  }

  async clickCreateButton() {
    await this.page.getByRole('button', { name: 'Create' }).click();
  }

  async isFooterVisible() {
    await this.page.waitForSelector('[data-testid=footer]');
  }
}
