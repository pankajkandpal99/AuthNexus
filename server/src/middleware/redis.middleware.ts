import { Request, Response, NextFunction } from "express";
import { redisService } from "../services/redis.service.js";

export const cacheMiddleware = (expireInSeconds: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cacheKey = `cache:${req.originalUrl}:${JSON.stringify(req.query)}`;

      // Check if data exists in cache
      const cachedData = await redisService.get(cacheKey);
      if (cachedData) {
        res.json(cachedData);
        return;
      }

      // Store original json method
      const originalJson = res.json;

      // Override json method to cache response
      res.json = function (data: any) {
        // Cache the response
        redisService.set(cacheKey, data, expireInSeconds).catch((err) => {
          console.error("Cache set error:", err);
        });

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next();
    }
  };
};

export const invalidateCache = (pattern: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Store original json method
      const originalJson = res.json;

      // Override json method to invalidate cache after successful response
      res.json = function (data: any) {
        // Invalidate cache pattern (simplified for assignment)
        // In production, you'd use Redis SCAN or implement proper cache invalidation

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error("Cache invalidation error:", error);
      next();
    }
  };
};

export const rateLimitMiddleware = (
  limit: number = 100,
  windowInSeconds: number = 3600
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id || req.ip;
      const key = `rate_limit:${userId}`;

      const result = await redisService.checkRateLimit(
        key,
        limit,
        windowInSeconds
      );

      // Set rate limit headers
      res.set({
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
      });

      if (!result.allowed) {
        res.status(429).json({
          error: "Too Many Requests",
          message: "Rate limit exceeded",
          resetTime: result.resetTime,
        });

        return;
      }

      next();
    } catch (error) {
      console.error("Rate limit middleware error:", error);
      next();
    }
  };
};
