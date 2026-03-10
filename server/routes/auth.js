const express = require("express");
const router = express.Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");
const slowDown = require("express-slow-down");
const User = require("../models/User");
const {
  signToken,
  protect,
  recordFailedLogin,
  resetFailedLogin,
  isAccountLocked,
  MAX_FAILED_ATTEMPTS,
  LOCK_DURATION_MINUTES,
} = require("../middleware/auth");

// ─────────────────────────────────────────────────────────────────────────────
// Rate limiters
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Global limiter — applied to every route in this file.
 * Last line of defence against general endpoint abuse.
 */
const globalAuthLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
});

/**
 * Strict limiter for login — 10 attempts per IP per 15 minutes.
 * skipSuccessfulRequests means only failed responses burn the quota,
 * so real users are not penalised for logging in normally.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message:
      "Too many login attempts from this IP. Please wait 15 minutes and try again.",
  },
  // ipKeyGenerator handles both IPv4 and IPv6 correctly
  keyGenerator: (req) => ipKeyGenerator(req),
});

/**
 * Progressive delay — after 3 failed attempts each subsequent response is
 * slowed by 500 ms (capped at 5 s). Frustrates automated scripts without
 * immediately locking out real users.
 */
const loginSlowDown = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 3,
  delayMs: (used) => (used - 3) * 500,
  maxDelayMs: 5000,
  skipSuccessfulRequests: true,
});

/**
 * Lenient limiter for registration — 5 new accounts per IP per hour.
 * Prevents mass account creation without bothering normal users.
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many accounts created from this IP. Please wait an hour and try again.",
  },
});

// Apply the global limiter to every route in this file
router.use(globalAuthLimiter);

// ── Google OAuth Strategy ──────────────────────────────────────────────────
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
        if (!email)
          return done(new Error("No email returned from Google"), null);

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName || email.split("@")[0],
            email,
            password: require("crypto").randomBytes(32).toString("hex"),
            role: "user",
            googleId: profile.id,
          });
        } else if (!user.googleId) {
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

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    done(null, await User.findById(id));
  } catch (e) {
    done(e, null);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
router.post("/register", registerLimiter, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: "user",
    });
    const token = signToken(user._id);

    return res.status(201).json({
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
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
router.post("/login", loginSlowDown, loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // ── Account lockout check ──────────────────────────────────────────────
    if (user && (await isAccountLocked(user))) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60_000);
      return res.status(423).json({
        success: false,
        message: `Account temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute${
          minutesLeft !== 1 ? "s" : ""
        }.`,
        lockedUntil: user.lockUntil,
      });
    }

    // ── Credential validation ──────────────────────────────────────────────
    // Single vague error for both "no user" and "wrong password" to prevent
    // user enumeration attacks.
    if (!user || !(await user.matchPassword(password))) {
      if (user) {
        const updated = await recordFailedLogin(user);
        const remaining = MAX_FAILED_ATTEMPTS - updated.failedLoginAttempts;

        if (remaining <= 0) {
          return res.status(423).json({
            success: false,
            message: `Account locked after too many failed attempts. Try again in ${LOCK_DURATION_MINUTES} minutes.`,
            lockedUntil: updated.lockUntil,
          });
        }

        return res.status(401).json({
          success: false,
          message: `Invalid email or password. ${remaining} attempt${
            remaining !== 1 ? "s" : ""
          } remaining before your account is locked.`,
        });
      }

      // No matching user — same shape, no attempt hint to avoid enumeration
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ── Successful login ───────────────────────────────────────────────────
    await resetFailedLogin(user);
    const token = signToken(user._id);

    return res.json({
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
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────────────────────────────────────
router.get("/me", protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ─────────────────────────────────────────────────────────────────────────────
// Google OAuth
// ─────────────────────────────────────────────────────────────────────────────

// Step 1 — redirect to Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Step 2 — Google redirects back here
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
  }),
  (req, res) => {
    const token = signToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`);
  }
);

module.exports = router;
