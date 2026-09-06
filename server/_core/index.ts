import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { healthHandler } from "./health";
import { startRateLimitSweeper } from "./rateLimit";
import { startTelegramOutboxWorker } from "./telegramWorker";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.set("trust proxy", 1);
  // Baseline security headers without an extra dependency.
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
  });
  // Body size is capped at 1mb: legitimate requests (calculator lead with a
  // 2000-char note) stay far below it, and oversized bodies are a DoS vector.
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));
  app.get("/healthz", healthHandler);
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError: ({ error, path }) => {
        console.error(
          `[tRPC] ${error.code} on ${path ?? "unknown"}:`,
          error.message
        );
      },
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  // In production (Railway etc.) the assigned PORT must be used as-is:
  // silently hopping to another port breaks the platform's routing.
  const port =
    process.env.NODE_ENV === "production"
      ? preferredPort
      : await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  startRateLimitSweeper(10 * 60_000);
  startTelegramOutboxWorker();

  // Drain connections on platform redeploy so in-flight requests finish.
  const shutdown = (signal: string) => {
    console.log(`[Server] ${signal} received, shutting down gracefully`);
    server.close(() => process.exit(0));
    // Hard stop if sockets refuse to drain.
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("unhandledRejection", reason => {
    console.error("[Process] unhandledRejection:", reason);
  });
  process.on("uncaughtException", error => {
    console.error("[Process] uncaughtException:", error);
    process.exit(1);
  });
}

startServer().catch(error => {
  console.error("Fatal: server failed to start", error);
  process.exit(1);
});
