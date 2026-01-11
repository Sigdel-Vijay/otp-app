const Redis = require("ioredis");

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 20,
    });

redis.on("connect", () => console.log("Connected to Redis successfully!"));
redis.on("error", (err) => console.error("Redis error:", err.message));

module.exports = redis;
