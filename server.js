// server.js
require("dotenv").config(); // Load environment variables
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const otpRouter = require("./routes/otp"); // Import OTP routes

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Use OTP routes
app.use("/", otpRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
