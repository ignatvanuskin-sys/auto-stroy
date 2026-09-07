export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  /**
   * Demo mode keeps CRM mutations public for showcase purposes (the seeded
   * tenant is rendered without login). Set CRM_DEMO_MODE=false in production
   * to require an authenticated owner/manager for every CRM mutation.
   */
  crmDemoMode: process.env.CRM_DEMO_MODE !== "false",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID ?? "",
  telegramWorkerEnabled: process.env.ENABLE_TELEGRAM_WORKER === "true",
};
