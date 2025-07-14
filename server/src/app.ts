import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { corsOptions, staticCorsOptions } from "./config/corsOptions.js";
import { contextMiddleware } from "./middleware/context.js";
import path, { dirname } from "path";
import { env } from "./config/env.js";
import { errorHandler } from "./error-handler/error-handler.js";
import baseRouter from "../src/api/v1/routes/index.js";
import { fileURLToPath } from "url";
import { logger } from "./utils/logger.js";
import { connectDatabase, sequelize } from "./lib/db.js";
import { redisService } from "./services/redis.service.js";

export const createApp = async () => {
  const app = express();

  // Initialize Redis connection
  // async function initializeRedis() {
  //   try {
  //     await redisService.connect();
  //     console.log("Redis connected successfully");
  //   } catch (error) {
  //     console.error("Redis connection failed:", error);
  //     // Don't exit process, let app run without Redis
  //   }
  // }

  try {
    logger.info("Establishing database connection...");
    await connectDatabase();
    logger.info("Database connection established successfully");

    // await initializeRedis();

    // Middlewares
    app.use(express.json());
    app.use(cors(corsOptions));
    app.use(cookieParser());
    app.use(helmet());
    app.use(contextMiddleware(sequelize));

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const uploadsPath = path.join(__dirname, "./uploads");
    app.use(
      "/uploads",
      cors(staticCorsOptions),
      express.static(uploadsPath, {
        setHeaders: (res, path) => {
          res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
          res.setHeader("Cache-Control", "public, max-age=31536000");
        },
      })
    );

    // Routes
    app.get("/", (req, res) => {
      res.status(200).json({
        success: true,
        message: "Server successfully deployed and running! 🚀",
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
      });
    });

    // Health check endpoint
    app.get("/health", async (req, res) => {
      try {
        await sequelize.authenticate();
        res.status(200).json({
          success: true,
          message: "Health check passed",
          database: "connected",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Health check failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // API routes
    app.use("/api/v1", baseRouter);

    // Error handler
    app.use(errorHandler as unknown as express.ErrorRequestHandler);

    return app;
  } catch (error) {
    logger.error("Failed to create app:", error);
    throw error;
  }
};
