import { Sequelize } from "sequelize";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

// Simple database configuration for development
const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST || "localhost",
  port: env.DB_PORT ? parseInt(env.DB_PORT) : 3306,
  dialect: "mysql",
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Simple connection function
export const connectDatabase = async () => {
  try {
    await sequelize.authenticate(); // Test connection
    logger.info("Database connected successfully");

    await import("../models/user.model.js");
    // logger.info("Models imported successfully");

    // Sync database (only for development)
    if (env.NODE_ENV === "development") {
      try {
        await sequelize.sync();
        logger.info("Database synchronized");
      } catch (syncError) {
        console.error(syncError);
        logger.error("Sequelize sync failed:", syncError);
      }
    }

    return sequelize;
  } catch (error) {
    logger.error("Database connection failed:", error);
    throw error;
  }
};

// Simple disconnect function
export const disconnectDatabase = async () => {
  try {
    await sequelize.close();
    logger.info("Database disconnected");
  } catch (error) {
    logger.error("Error disconnecting database:", error);
  }
};

export { sequelize }; // Export sequelize instance
