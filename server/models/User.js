const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: { type: String, trim: true },

    password: {
      type: String,
      minlength: 8, // raised from 6 — aligns with register route validation
      // Not required — Google OAuth users have no password
    },

    role: { type: String, enum: ["user", "admin"], default: "user" },

    googleId: {
      type: String,
      sparse: true, // allows multiple documents to have null googleId
    },

    // ── Brute-force / lockout tracking ──────────────────────────────────────
    // Incremented on every failed password attempt, reset on success.
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    // When set and in the future, all login attempts are rejected until this
    // timestamp passes. The middleware clears it automatically once expired.
    lockUntil: {
      type: Date,
      default: undefined,
    },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────────────────────────────────
// Sparse index lets Mongo quickly filter on lockUntil without bloating the index
// with documents that have no lock set.
userSchema.index({ lockUntil: 1 }, { sparse: true });

// ── Virtuals ──────────────────────────────────────────────────────────────
// Convenience boolean so route handlers can do `user.isLocked` without math.
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ── Hooks ─────────────────────────────────────────────────────────────────
// Hash password before saving (only if it was set or changed).
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Methods ───────────────────────────────────────────────────────────────

/**
 * Compare a plain-text password against the stored hash.
 * Safely returns false for Google-only accounts (no password stored).
 */
userSchema.methods.matchPassword = async function (entered) {
  if (!this.password) return false;
  return bcrypt.compare(entered, this.password);
};

/**
 * Increment failed attempts and lock the account if the ceiling is reached.
 *
 * @param {number} maxAttempts  - lock threshold (default 5)
 * @param {number} lockMinutes  - lock duration in minutes (default 15)
 * @returns {Promise<this>}
 */
userSchema.methods.recordFailedLogin = async function (
  maxAttempts = 5,
  lockMinutes = 15
) {
  this.failedLoginAttempts += 1;

  if (this.failedLoginAttempts >= maxAttempts) {
    this.lockUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
  }

  return this.save();
};

/**
 * Clear lockout state after a successful login.
 * Skips the DB write if there is nothing to clear.
 *
 * @returns {Promise<this>}
 */
userSchema.methods.resetFailedLogin = async function () {
  if (!this.failedLoginAttempts && !this.lockUntil) return this;

  this.failedLoginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
