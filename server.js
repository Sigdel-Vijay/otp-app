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
const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 50, connectTimeout: 10000 })
  : new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 50,
      connectTimeout: 10000,
    });

let isConnected = false;
redis.on("connect", () => {
  if (!isConnected) {
    console.log("Connected to Redis successfully!");
    isConnected = true;
  }
});

redis.on("error", (err) => console.error("Redis error:", err.message));

app.locals.redis = redis;

// ----- ROUTES -----
app.use("/", otpRouter);

// ----- START SERVER -----
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
