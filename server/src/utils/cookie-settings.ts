import { env } from "../config/env.js";

export const getAuthCookieSettings = () => {
  const isProduction = env.NODE_ENV === "production";

  return {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? ("none" as "none") : ("lax" as "lax"),
    domain: isProduction ? ".vercel.app" : undefined,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
};
