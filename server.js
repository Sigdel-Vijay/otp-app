require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const otpRouter = require("./routes/otp");
const Redis = require("ioredis");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ----- REDIS SETUP -----
let redis;
if (process.env.REDIS_URL) {
  // Cloud Redis
  redis = new Redis(process.env.REDIS_URL);
} else {
  // Local Redis fallback
  redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 20,
  });
}

// Redis event listeners
redis.on("connect", () => console.log("Connected to Redis successfully!"));
redis.on("error", (err) => console.error("Redis error:", err.message));

// Make Redis available in routes
app.locals.redis = redis;

// ----- ROUTES -----
app.use("/", otpRouter);

// ----- START SERVER -----
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
