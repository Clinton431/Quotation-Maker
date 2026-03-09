const express = require("express");
const router = express.Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const { signToken, protect } = require("../middleware/auth");

// ── Configure Google Strategy ──────────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) return done(new Error("No email from Google"), null);

        // Find existing user or create one
        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName || email.split("@")[0],
            email,
            // Google users have no password — set a random unguessable one
            password: require("crypto").randomBytes(32).toString("hex"),
            role: "user",
            googleId: profile.id,
          });
        } else if (!user.googleId) {
          // Link Google ID to existing email account
          user.googleId = profile.id;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Minimal serialization (only needed to satisfy passport internals)
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (e) {
    done(e, null);
  }
});

// ── Existing routes ────────────────────────────────────────────────────────

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(409).json({
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
    res.status(500).json({
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
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

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
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});

// GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// ── Google OAuth routes ────────────────────────────────────────────────────

// Step 1: redirect to Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Step 2: Google redirects back here
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
  }),
  (req, res) => {
    // Issue your own JWT and redirect to the frontend with it
    const token = signToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`);
  }
);

module.exports = router;
