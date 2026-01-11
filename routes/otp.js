// routes/otp.js
const express = require("express");
const bcrypt = require("bcrypt");
const transporter = require("../config/mail");
const redis = require("../config/redis");

const router = express.Router();

// Helper function: generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ---------- SEND OTP ----------
router.post("/send-email-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  const otp = generateOtp();
  const hash = await bcrypt.hash(otp, 10);

  try {
    // Store OTP in Redis for 5 mins
    await redis.setex(`otp:${email}`, 300, hash);

    // Send OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your verification code",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({ message: "Failed to send OTP" });
}
});

// ---------- VERIFY OTP ----------
router.post("/verify-email-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP required" });

  try {
    const storedHash = await redis.get(`otp:${email}`);
    if (!storedHash)
      return res.status(400).json({ message: "OTP expired or not found" });

    const match = await bcrypt.compare(otp, storedHash);
    if (!match) return res.status(400).json({ message: "Invalid OTP" });

    // Delete OTP after verification
    await redis.del(`otp:${email}`);

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
