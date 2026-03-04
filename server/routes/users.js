const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

// All user-management routes require a valid JWT + admin role
router.use(protect, adminOnly);

// ── GET /api/users — list all users ───────────────────────────────────────────
// AdminDashboard calls unwrapList(res.data, "users", "customers")
// so we return { success, users: [...] } to match the "users" key it looks for.
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: err.message,
    });
  }
});

// ── PATCH /api/users/:id/role — change a user's role ─────────────────────────
router.patch("/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role))
      return res.status(400).json({
        success: false,
        message: "role must be 'user' or 'admin'",
      });

    if (req.params.id === String(req.user._id))
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({ success: true, message: `Role updated to ${role}`, user });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update role",
      error: err.message,
    });
  }
});

// ── DELETE /api/users/:id — delete a user ────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    if (req.params.id === String(req.user._id))
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: err.message,
    });
  }
});

module.exports = router;
