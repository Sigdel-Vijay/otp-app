// config/mail.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Gmail SMTP
  auth: {
    user: process.env.sigdelbijaya385@gmail.com,
    pass: process.env.wkdw hkuu izmy mhxm, // Gmail App Password
  },
});

module.exports = transporter;
