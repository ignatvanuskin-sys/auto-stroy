import { and, eq } from "drizzle-orm";
import { notifications } from "../../drizzle/schema";
import { getDb } from "../db";
import { ENV } from "./env";

type OutboxPayload = {
  title?: string;
  text?: string;
  leadId?: number;
};

const POLL_INTERVAL_MS = 60_000;
const MAX_MESSAGE_LENGTH = 3_500;

/** Exported for tests; not part of the public API. */
export function extractOutboxText(
  payload: unknown
): { title: string; text: string } | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as OutboxPayload;
  if (typeof record.text !== "string" || record.text.trim().length === 0) {
    return null;
  }
  const title = typeof record.title === "string" ? record.title : "";
  return { title, text: record.text };
}

/** "sent" = delivered, "retry" = transient failure (keep queued), "failed" = permanent failure. */
type DeliveryResult = "sent" | "retry" | "failed";

async function sendTelegramMessage(
  chatId: string,
  text: string
): Promise<DeliveryResult> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${ENV.telegramBotToken}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text.slice(0, MAX_MESSAGE_LENGTH),
        }),
      }
    );
    if (response.ok) return "sent";
    const detail = await response.text().catch(() => "");
    console.warn(
      `[TelegramWorker] send failed (${response.status})${detail ? `: ${detail.slice(0, 300)}` : ""}`
    );
    // 5xx/429 are upstream/transient; 4xx means the message or chat is wrong.
    return response.status >= 500 || response.status === 429
      ? "retry"
      : "failed";
  } catch (error) {
    console.warn(
      "[TelegramWorker] network error:",
      error instanceof Error ? error.message : error
    );
    return "retry";
  }
}

/** Exported for tests and manual draining; the interval worker wraps this. */
export async function processQueue(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const queued = await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.status, "queued"),
        eq(notifications.channel, "Telegram")
      )
    )
    .limit(10);

  for (const item of queued) {
    const content = extractOutboxText(item.payload);
    if (!content) {
      // Nothing sendable in the payload; mark failed so it is not retried forever.
      await db
        .update(notifications)
        .set({ status: "failed" })
        .where(eq(notifications.id, item.id));
      continue;
    }

    const result = await sendTelegramMessage(
      ENV.telegramChatId,
      `${content.title ? `${content.title}\n` : ""}${content.text}`
    );
    if (result === "retry") continue; // stay queued, next tick retries
    await db
      .update(notifications)
      .set({ status: result === "sent" ? "sent" : "failed" })
      .where(eq(notifications.id, item.id));
  }
}

/**
 * Drains the persisted Telegram outbox (notifications.status = 'queued').
 * Enabled only when ENABLE_TELEGRAM_WORKER=true and both TELEGRAM_BOT_TOKEN
 * and TELEGRAM_CHAT_ID are configured; otherwise this is a no-op and records
 * stay queued for manual/CRM visibility.
 */
export function startTelegramOutboxWorker(): void {
  if (!ENV.telegramWorkerEnabled) return;
  if (!ENV.telegramBotToken || !ENV.telegramChatId) {
    console.warn(
      "[TelegramWorker] enabled but TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID missing; staying idle"
    );
    return;
  }

  const timer = setInterval(() => {
    processQueue().catch(error => {
      console.warn(
        "[TelegramWorker] tick failed:",
        error instanceof Error ? error.message : error
      );
    });
  }, POLL_INTERVAL_MS);
  timer.unref();

  console.log("[TelegramWorker] started (polling every 60s)");
}
