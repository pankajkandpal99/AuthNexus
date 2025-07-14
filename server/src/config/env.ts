import { z } from "zod";
import dotenv from "dotenv";
import { processImage } from "@/services/image-processing.service.js";
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("8800"),
  JWT_SECRET: z.string(),

  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.string().default("3306"),

  AUTO_SYNC_DB: z.string(),
  COOKIE_DOMAIN: z.string(),
  ALLOWED_ORIGINS: z.string(),
  BASE_URL: z.string(),

  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.string().default("587"),
  SMTP_SECURE: z.string().transform((val) => val === "true"),
  SMTP_USER: z.string().email(),
  SMTP_PASSWORD: z.string().min(1, "SMTP password cannot be empty"),
  SMTP_FROM_EMAIL: z.string().email(),
  SMTP_FROM_NAME: z.string().default("AuthNexus"),

  FRONTEND_URL: z.string().default("http://localhost:5173"),

  UPSTASH_REDIS_URL: z.string(),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.string().default("6379"),
  REDIS_PASSWORD: z.string().optional().default(""),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = (() => {
  try {
    return envSchema.parse({
      NODE_ENV: process.env.NODE_ENV as "development" | "production" | "test",
      PORT: process.env.PORT || "3000",
      JWT_SECRET: process.env.JWT_SECRET,

      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD,
      DB_NAME: process.env.DB_NAME,
      DB_HOST: process.env.DB_HOST || "localhost",
      DB_PORT: process.env.DB_PORT || "3306",

      AUTO_SYNC_DB: process.env.AUTO_SYNC_DB || "true",
      COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || "",
      BASE_URL: process.env.BASE_URL || "http://localhost:8800",

      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_SECURE: process.env.SMTP_SECURE,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASSWORD: process.env.SMTP_PASSWORD,
      SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
      SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || "AuthNexus",

      FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",

      UPSTASH_REDIS_URL: process.env.UPSTASH_REDIS_URL,
      REDIS_HOST: process.env.REDIS_HOST,
      REDIS_PORT: process.env.REDIS_PORT || "6379",
      REDIS_PASSWORD: process.env.REDIS_PASSWORD || "",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Environment Variable Validation Failed:");
      error.errors.forEach((err) => {
        console.error(`- ${err.path.join(".")}: ${err.message}`);
      });
      throw new Error(`Invalid environment variables. Check your .env file.`);
    }
    throw error;
  }
})();
