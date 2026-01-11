// config/redis.js
const Redis = require("ioredis");

// Connect to cloud Redis using REDIS_URL
const redis = new Redis(process.env.REDIS_URL);

module.exports = redis;
