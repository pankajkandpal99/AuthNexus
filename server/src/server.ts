import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { disconnectDatabase } from "./lib/db.js";
import { logger } from "./utils/logger.js";

const startServer = async () => {
  try {
    const app = await createApp();

    const server = app.listen(env.PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    process.on("SIGTERM", () => {
      logger.info("SIGTERM received: closing server");
      server.close(async () => {
        await disconnectDatabase();
        logger.info("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
