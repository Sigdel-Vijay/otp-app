const express = require("express");
const bcrypt = require("bcrypt");
const transporter = require("../config/mail");
const redis = require("../config/redis");

const router = express.Router();

// helper function
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// SEND OTP
router.post("/send-email-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email required" });

  const otp = generateOtp();

  // hash otp before storing
  const hash = await bcrypt.hash(otp, 10);

  // store for 5 mins in redis
  await redis.setex(`otp:${email}`, 300, hash);

  try {
    await transporter.sendMail({
      from: "Your App",
      to: email,
      subject: "Your verification code",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`
    });

    res.json({ message: "OTP sent" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// VERIFY OTP
router.post("/verify-email-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP required" });

  const storedHash = await redis.get(`otp:${email}`);

  if (!storedHash) return res.status(400).json({ message: "OTP expired or not found" });

  const match = await bcrypt.compare(otp, storedHash);

  if (!match) return res.status(400).json({ message: "Invalid OTP" });

  // delete after success
  await redis.del(`otp:${email}`);

  res.json({ message: "Email verified successfully" });
});

module.exports = router;
