import { Page } from '@playwright/test';

export class CreationPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToCreationPage() {
    await this.page.goto('/create');
  }

  async switchToWriteTextTab() {
    await this.page.getByText('Write Text').click();
  }

  async enterText(text: string) {
    await this.page.getByRole('textbox').fill(text);
  }

  async clickConnectWalletButton() {
    await this.page.getByRole('button', { name: 'Connect Wallet' }).click();
  }
}
