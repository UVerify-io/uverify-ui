import { Page } from '@playwright/test';

export class VerificationPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToVerificationPage() {
    await this.page.goto('/verify');
  }

  async switchToWriteTextTab() {
    await this.page.getByText('Write Text').click();
  }

  async enterText(text: string) {
    await this.page.getByRole('textbox').fill(text);
  }

  async clickVerifyButton() {
    await this.page.getByRole('button', { name: 'Verify' }).click();
  }
}
