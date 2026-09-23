import { type Locator, type Page } from "@playwright/test";

export class IgamingPage {
  readonly page: Page;

  // Deposit
  readonly depositAmount: Locator;
  readonly depositButton: Locator;
  readonly depositConfirmation: Locator;
  readonly depositError: Locator;

  // Bet slip
  readonly market: Locator;
  readonly selection: Locator;
  readonly stake: Locator;
  readonly placeBetButton: Locator;
  readonly betConfirmation: Locator;
  readonly betError: Locator;

  // Chrome / dashboard
  readonly walletBalance: Locator;
  readonly accountName: Locator;
  readonly dashboardBalance: Locator;

  constructor(page: Page) {
    this.page = page;

    this.depositAmount = page.getByLabel("Deposit amount");
    this.depositButton = page.getByRole("button", { name: "Deposit" });
    this.depositConfirmation = page.getByTestId("deposit-confirmation");
    this.depositError = page.getByRole("form", { name: "Deposit" }).getByRole("alert");

    this.market = page.getByLabel("Market");
    this.selection = page.getByLabel("Selection");
    this.stake = page.getByLabel("Stake");
    this.placeBetButton = page.getByRole("button", { name: "Place Bet" });
    this.betConfirmation = page.getByTestId("bet-confirmation");
    this.betError = page.getByRole("form", { name: "Bet slip" }).getByRole("alert");

    this.walletBalance = page.getByTestId("wallet-balance");
    this.accountName = page.getByTestId("account-name");
    this.dashboardBalance = page.getByTestId("dashboard-balance");
  }

  async goto() {
    await this.page.goto("/practice/igaming");
  }

  async gotoLogin() {
    await this.page.goto("/practice/igaming/login");
  }

  async gotoHistory() {
    await this.page.goto("/practice/igaming/history");
  }

  async gotoResponsibleGambling() {
    await this.page.goto("/practice/igaming/responsible-gambling");
  }

  async login(email: string, password: string) {
    await this.gotoLogin();
    await this.page.getByLabel("Email").fill(email);
    await this.page.getByLabel("Password").fill(password);
    await this.page.getByRole("button", { name: "Sign In" }).click();
  }

  async deposit(amount: number) {
    await this.depositAmount.fill(String(amount));
    await this.depositButton.click();
  }

  /** `marketLabel`/`optionLabel` must exactly match the option text rendered in the select. */
  async placeBet(marketLabel: string, optionLabel: string, stake: number) {
    await this.market.selectOption({ label: marketLabel });
    await this.selection.selectOption({ label: optionLabel });
    await this.stake.fill(String(stake));
    await this.placeBetButton.click();
  }

  async setDepositLimit(amount: number) {
    await this.gotoResponsibleGambling();
    await this.page.getByLabel("Daily deposit limit").fill(String(amount));
    await this.page.getByRole("button", { name: "Save limit" }).click();
  }

  async selfExclude() {
    await this.gotoResponsibleGambling();
    await this.page.getByRole("button", { name: "Self-exclude" }).click();
    await this.page.getByRole("button", { name: "Confirm self-exclusion" }).click();
    // Waits for the confirmation state, not just the click: the API call the
    // click triggers is async, so callers that immediately fire a follow-up
    // request (e.g. via page.request) would otherwise race it.
    await this.page.getByTestId("self-exclusion-confirmed").waitFor({ state: "visible" });
  }

  betRow(betId: string): Locator {
    return this.page.getByTestId("bet-row").filter({ hasText: betId });
  }

  async settleBet(betId: string, outcome: "win" | "lose") {
    await this.gotoHistory();
    await this.betRow(betId)
      .getByRole("button", { name: outcome === "win" ? "Settle win" : "Settle lose" })
      .click();
  }
}
