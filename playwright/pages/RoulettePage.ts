import { type Locator, type Page } from "@playwright/test";

export type RouletteBetType = "number" | "red" | "black" | "odd" | "even" | "low" | "high";

const BET_TYPE_LABELS: Record<RouletteBetType, string> = {
  number: "Number",
  red: "Red",
  black: "Black",
  odd: "Odd",
  even: "Even",
  low: "Low",
  high: "High",
};

export class RoulettePage {
  readonly page: Page;

  readonly balance: Locator;
  readonly winningNumber: Locator;
  readonly winningColor: Locator;
  readonly currentBet: Locator;
  readonly gameResult: Locator;
  readonly payout: Locator;
  readonly validationMessage: Locator;
  readonly betHistory: Locator;
  readonly betHistoryRows: Locator;

  readonly numberSelection: Locator;
  readonly stake: Locator;
  readonly placeBetButton: Locator;
  readonly spinButton: Locator;
  readonly resetButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.balance = page.getByTestId("balance");
    this.winningNumber = page.getByTestId("winning-number");
    this.winningColor = page.getByTestId("winning-color");
    this.currentBet = page.getByTestId("current-bet");
    this.gameResult = page.getByTestId("game-result");
    this.payout = page.getByTestId("payout");
    this.validationMessage = page.getByTestId("validation-message");
    this.betHistory = page.getByTestId("bet-history");
    this.betHistoryRows = page.getByTestId("bet-history-row");

    this.numberSelection = page.getByLabel("Number (0-36)");
    this.stake = page.getByLabel("Bet Amount");
    this.placeBetButton = page.getByRole("button", { name: "Place Bet" });
    this.spinButton = page.getByRole("button", { name: "Spin" });
    this.resetButton = page.getByRole("button", { name: "Reset Game" });
  }

  async open() {
    await this.page.goto("/practice/casino-roulette");
    // Wait for the page's own initial state/history fetches to resolve — and
    // with them, for this session's cookie to be firmly established — before
    // any caller issues a page.request call of its own (e.g. forceResult()).
    // Without this, the page's fetch and an out-of-band page.request could
    // each independently be the "first" request and end up creating two
    // different sessions on two different cookies.
    await this.page.getByRole("heading", { name: "European Roulette" }).waitFor({ state: "visible" });
  }

  betTypeRadio(type: RouletteBetType): Locator {
    return this.page.getByRole("radio", { name: BET_TYPE_LABELS[type] });
  }

  async selectBetType(type: RouletteBetType) {
    await this.betTypeRadio(type).check();
  }

  async selectNumber(n: number) {
    await this.numberSelection.fill(String(n));
  }

  async setBetAmount(amount: number) {
    await this.stake.fill(String(amount));
  }

  async placeBet() {
    await this.placeBetButton.click();
  }

  async spin() {
    await this.spinButton.click();
  }

  async resetGame() {
    await this.resetButton.click();
  }

  async getBalance(): Promise<string> {
    return (await this.balance.textContent()) ?? "";
  }

  async getWinningNumber(): Promise<string> {
    return (await this.winningNumber.textContent()) ?? "";
  }

  async getResult(): Promise<string> {
    return (await this.gameResult.textContent()) ?? "";
  }

  async getPayout(): Promise<string> {
    return (await this.payout.textContent()) ?? "";
  }

  async getBetHistory(): Promise<string[]> {
    return this.betHistoryRows.allTextContents();
  }

  /**
   * Convenience combining the three fields a bet needs. Leaves `selection`
   * untouched (and disabled) for the six bet types that don't take one.
   */
  async placeBetOf(type: RouletteBetType, amount: number, selection?: number) {
    await this.selectBetType(type);
    if (type === "number" && selection !== undefined) {
      await this.selectNumber(selection);
    }
    await this.setBetAmount(amount);
    await this.placeBet();
  }

  /**
   * TEST-ONLY. Forces the result of the next spin via the API's test-mode
   * header. See app/api/casino/roulette/test-result/route.ts.
   */
  async forceResult(n: number) {
    await this.page.request.post("/api/casino/roulette/test-result", {
      headers: { "X-Test-Mode": "enable" },
      data: { result: n },
    });
  }
}
