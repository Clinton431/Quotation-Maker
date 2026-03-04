const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { signToken, protect } = require("../middleware/auth");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, email and password are required",
        });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res
        .status(409)
        .json({
          success: false,
          message: "An account with this email already exists",
        });

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: "user",
    });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("[register]", err.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Registration failed. Please try again.",
      });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password)))
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });

    const token = signToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("[login]", err.message);
    res
      .status(500)
      .json({ success: false, message: "Login failed. Please try again." });
  }
});

// GET /api/auth/me  — get logged-in user info
router.get("/me", protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
