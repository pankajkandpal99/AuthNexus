import { CorsOptions } from "cors";
import { env } from "./env.js";

const allowedOrigins = env.ALLOWED_ORIGINS
  ? env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow all origins in development
    if (env.NODE_ENV === "development") {
      return callback(null, true);
    }

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // Check allowed origins in production
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Origin not allowed
    console.warn(`CORS blocked for origin: ${origin}`);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  optionsSuccessStatus: 204, // Some legacy browsers choke on 204
  maxAge: 86400,
  preflightContinue: false,
  exposedHeaders: ["Set-Cookie", "Authorization", "X-CSRF-Token"],
};

export const staticCorsOptions = {
  origin: env.ALLOWED_ORIGINS?.split(",")[0] || "*",
  credentials: true,
  optionsSuccessStatus: 200,
};
