const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/user.js");
const sendEmail = require("../utils/sendEmail"); 

const router = express.Router();


router.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Passwords do not match" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});


router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    
    const resetUrl = `http://localhost:5000/api/auth/reset-password/${resetToken}`;
    const message = `You requested a password reset.\n\nClick this link or copy it into your browser:\n${resetUrl}`;

    
    await sendEmail(user.email, "Password Reset Request", message);

    res.json({ msg: "Password reset email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error sending reset email" });
  }
});

module.exports = router;
