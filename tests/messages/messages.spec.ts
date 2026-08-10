import { test, expect } from "../../playwright/fixtures/test";

test.describe("Support messages", () => {
  test("sends a message and confirms it", async ({ messagesPage }) => {
    await messagesPage.goto();
    await messagesPage.sendMessage(
      "Where is my order?",
      "Any update on the delivery?",
    );

    await expect(messagesPage.success).toBeVisible();
    await expect(messagesPage.rows.first()).toContainText("Where is my order?");
  });

  test("requires both a subject and a message", async ({ messagesPage }) => {
    await messagesPage.goto();
    await messagesPage.send.click();

    await expect(messagesPage.page.getByText("Subject is required")).toBeVisible();
    await expect(messagesPage.page.getByText("Message is required")).toBeVisible();
    await expect(messagesPage.success).toBeHidden();
  });

  test("the payload the UI sends matches what was typed", async ({
    page,
    messagesPage,
  }) => {
    await messagesPage.goto();

    // Register the wait BEFORE the action that triggers it.
    const requestPromise = page.waitForRequest(
      (request) =>
        request.url().includes("/api/messages") && request.method() === "POST",
    );

    await messagesPage.sendMessage("Refund request", "Please refund ORD-839472.");

    const request = await requestPromise;
    expect(request.postDataJSON()).toMatchObject({
      subject: "Refund request",
      message: "Please refund ORD-839472.",
    });

    await expect(messagesPage.success).toBeVisible();
  });
});
