// server.js
require("dotenv").config(); // Load environment variables
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const otpRouter = require("./routes/otp"); // Import OTP routes
const Redis = require("ioredis");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ----- REDIS SETUP -----
const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 20, // optional, default is 20
});

// Handle Redis connection errors
redis.on("connect", () => {
  console.log("Connected to Redis successfully!");
});

redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

// Make Redis accessible in routes via app.locals
app.locals.redis = redis;

// ----- USE ROUTES -----
app.use("/", otpRouter);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
