import { createClient, RedisClientType } from "redis";
import { redisConfig } from "../config/redis-config.js";

class RedisService {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: redisConfig.url,
      socket: {
        host: redisConfig.socket?.host,
        port: redisConfig.socket?.port,
      },
      password: redisConfig.password,
    });

    this.client.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    this.client.on("connect", () => {
      console.log("Redis Connected");
      this.isConnected = true;
    });

    this.client.on("disconnect", () => {
      console.log("Redis Disconnected");
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
    }
  }

  // Set data with expiration
  async set(key: string, value: any, expireInSeconds?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);
    if (expireInSeconds) {
      await this.client.setEx(key, expireInSeconds, serializedValue);
    } else {
      await this.client.set(key, serializedValue);
    }
  }

  // Get data
  async get(key: string): Promise<any> {
    const result = await this.client.get(key);
    return result ? JSON.parse(result) : null;
  }

  // Delete data
  async del(key: string): Promise<boolean> {
    const result = await this.client.del(key);
    return result === 1;
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  // Set with hash
  async hSet(key: string, field: string, value: any): Promise<void> {
    await this.client.hSet(key, field, JSON.stringify(value));
  }

  // Get from hash
  async hGet(key: string, field: string): Promise<any> {
    const result = await this.client.hGet(key, field);
    return result ? JSON.parse(result) : null;
  }

  // Get all from hash
  async hGetAll(key: string): Promise<any> {
    const result = await this.client.hGetAll(key);
    const parsed: any = {};
    for (const [field, value] of Object.entries(result)) {
      parsed[field] = JSON.parse(value);
    }
    return parsed;
  }

  // Delete from hash
  async hDel(key: string, field: string): Promise<boolean> {
    const result = await this.client.hDel(key, field);
    return result === 1;
  }

  // Set expiration
  async expire(key: string, seconds: number): Promise<boolean> {
    const result = await this.client.expire(key, seconds);
    return result === 1;
  }

  // Get TTL
  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  async indexUserForSearch(user: any): Promise<void> {
    try {
      // Index by username
      await this.client.hSet(
        "user:search:username",
        user.username.toLowerCase(),
        JSON.stringify(user)
      );

      // Index by email
      await this.client.hSet(
        "user:search:email",
        user.email.toLowerCase(),
        JSON.stringify(user)
      );

      // Index by role
      await this.client.sAdd(
        `user:search:role:${user.role.toLowerCase()}`,
        user.id
      );
    } catch (err) {
      console.error("Redis index error:", err);
      throw err;
    }
  }

  // Search users
  async searchUsers(query: string): Promise<any[]> {
    try {
      // Search usernames
      const usernameResults = await this.client.hScan(
        "user:search:username",
        "0",
        { MATCH: `*${query.toLowerCase()}*` }
      );

      // Search emails
      const emailResults = await this.client.hScan("user:search:email", "0", {
        MATCH: `*${query.toLowerCase()}*`,
      });

      // Combine and deduplicate results
      const results = [
        ...usernameResults.entries.map((entry) => JSON.parse(entry.value)),
        ...emailResults.entries.map((entry) => JSON.parse(entry.value)),
      ];

      const uniqueResults = results.reduce((acc: any[], current: any) => {
        if (!acc.some((user) => user.id === current.id)) {
          acc.push(current);
        }
        return acc;
      }, []);

      return uniqueResults;
    } catch (err) {
      console.error("Redis search error:", err);
      throw err;
    }
  }

  async clearUserFromSearch(
    userId: string,
    username: string,
    email: string
  ): Promise<void> {
    try {
      await this.client.hDel("user:search:username", username.toLowerCase());
      await this.client.hDel("user:search:email", email.toLowerCase());
    } catch (err) {
      console.error("Redis clear from search error:", err);
      throw err;
    }
  }

  // Cache user data
  async cacheUser(
    userId: string,
    userData: any,
    expireInSeconds: number = 3600
  ): Promise<void> {
    await this.set(`user:${userId}`, userData, expireInSeconds);
    await this.set(
      `user:username:${userData.username?.toLowerCase()}`,
      userData,
      expireInSeconds
    );
    await this.set(
      `user:email:${userData.email?.toLowerCase()}`,
      userData,
      expireInSeconds
    );
  }

  // Get cached user
  async getCachedUser(identifier: string): Promise<any> {
    // Try by ID first
    let user = await this.get(`user:${identifier}`);
    if (user) return user;

    // Try by username
    user = await this.get(`user:username:${identifier.toLowerCase()}`);
    if (user) return user;

    // Try by email
    user = await this.get(`user:email:${identifier.toLowerCase()}`);
    return user;
  }

  // Clear user cache
  async clearUserCache(
    userId: string,
    username?: string,
    email?: string
  ): Promise<void> {
    await this.del(`user:${userId}`);
    if (username) await this.del(`user:username:${username.toLowerCase()}`);
    if (email) await this.del(`user:email:${email.toLowerCase()}`);
  }

  // Rate limiting
  async checkRateLimit(
    key: string,
    limit: number,
    windowInSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const current = (await this.get(key)) || 0;
    const remaining = limit - current;

    if (remaining <= 0) {
      const ttl = await this.ttl(key);
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + ttl * 1000,
      };
    }

    await this.set(key, current + 1, windowInSeconds);
    return {
      allowed: true,
      remaining: remaining - 1,
      resetTime: Date.now() + windowInSeconds * 1000,
    };
  }
}

export const redisService = new RedisService();
