const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─────────────────────────────────────────────────────────────────────────────
// Constants — single source of truth for lockout policy.
// routes/auth.js imports these so both files stay in sync automatically.
// ─────────────────────────────────────────────────────────────────────────────
const MAX_FAILED_ATTEMPTS = 5; // consecutive failures before account locks
const LOCK_DURATION_MINUTES = 15; // how long the lock lasts

// ─────────────────────────────────────────────────────────────────────────────
// signToken
// ─────────────────────────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ─────────────────────────────────────────────────────────────────────────────
// recordFailedLogin
// Thin wrapper that delegates to the User model method so lockout logic
// lives in one place and travels with the document.
// ─────────────────────────────────────────────────────────────────────────────
const recordFailedLogin = (user) =>
  user.recordFailedLogin(MAX_FAILED_ATTEMPTS, LOCK_DURATION_MINUTES);

// ─────────────────────────────────────────────────────────────────────────────
// resetFailedLogin
// ─────────────────────────────────────────────────────────────────────────────
const resetFailedLogin = (user) => user.resetFailedLogin();

// ─────────────────────────────────────────────────────────────────────────────
// isAccountLocked
// Uses the `isLocked` virtual for the active check, then transparently clears
// any lock whose timestamp has already passed so the user can try again.
// ─────────────────────────────────────────────────────────────────────────────
const isAccountLocked = async (user) => {
  if (!user.lockUntil) return false;

  if (user.isLocked) return true;

  // Lock window has expired — clear it cleanly
  await user.resetFailedLogin();
  return false;
};

// ─────────────────────────────────────────────────────────────────────────────
// protect  (JWT authentication middleware)
// ─────────────────────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — no token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Token invalid or expired",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// adminOnly
// ─────────────────────────────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }
  next();
};

module.exports = {
  signToken,
  protect,
  adminOnly,
  recordFailedLogin,
  resetFailedLogin,
  isAccountLocked,
  MAX_FAILED_ATTEMPTS,
  LOCK_DURATION_MINUTES,
};
