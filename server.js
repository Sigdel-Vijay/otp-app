const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// temporary OTP storage (replace with DB/Redis in production)
const otpStore = {};

// nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "youremail@gmail.com",
        pass: "your-app-password"  // NOT normal password, use app password
    }
});

// generate 6 digit OTP
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ---------- SEND OTP ----------
app.post("/send-email-otp", async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = generateOtp();

    // store OTP with expiry 5 mins
    otpStore[email] = {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000
    };

    try {
        await transporter.sendMail({
            from: "Food Delivery App",
            to: email,
            subject: "Your verification code",
            text: `Your OTP is ${otp}. It will expire in 5 minutes.`
        });

        res.json({ message: "OTP sent successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to send OTP" });
    }
});

// ---------- VERIFY OTP ----------
app.post("/verify-email-otp", (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp)
        return res.status(400).json({ message: "Email and OTP required" });

    const record = otpStore[email];
    if (!record)
        return res.status(400).json({ message: "OTP not requested" });

    if (Date.now() > record.expiresAt)
        return res.status(400).json({ message: "OTP expired" });

    if (record.otp !== otp)
        return res.status(400).json({ message: "Invalid OTP" });

    // success
    delete otpStore[email]; // optional: remove OTP after success
    res.json({ message: "Email verified successfully" });
});

// start server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
