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
      minlength: 6,
      // Not required — Google OAuth users have no password
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    googleId: {
      type: String,
      sparse: true, // allows multiple documents to have null googleId
    },
  },
  { timestamps: true }
);

// Hash password before saving (only if it was set / changed)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password — safely returns false if user has no password (Google-only account)
userSchema.methods.matchPassword = async function (entered) {
  if (!this.password) return false;
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);
