import { type RedisClientOptions } from "redis";
import { env } from "./env.js";

interface RedisConfig extends Omit<RedisClientOptions, "socket"> {
  url?: string;
  socket?: {
    host?: string;
    port?: number;
    reconnectStrategy?: (retries: number) => number | Error;
    keepAlive?: number;
    tls?: boolean;
  };
  password?: string;
  tls?: {
    rejectUnauthorized: boolean;
  };
}

const getRedisConfig = (): RedisConfig => {
  if (env.UPSTASH_REDIS_URL) {
    return {
      url: env.UPSTASH_REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 5000),
      },
      tls: {
        rejectUnauthorized: false, // For Upstash connections
      },
    };
  }

  return {
    socket: {
      host: env.REDIS_HOST || "localhost",
      port: parseInt(env.REDIS_PORT || "6379"),
      reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
    },
    password: env.REDIS_PASSWORD,
  };
};

export const redisConfig = getRedisConfig();
