const express = require("express");
const router = express.Router();
const Quotation = require("../models/Quotation");
const { protect, adminOnly } = require("../middleware/auth");

// ─────────────────────────────────────────────────────────────────────────────
// Helper: try to extract userId from Bearer token without hard-failing.
// ─────────────────────────────────────────────────────────────────────────────
function resolveUserIdFromToken(req) {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return null;
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
    return decoded.id || null;
  } catch (_) {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: sanitise a single additional charge entry.
// Ensures every field is present and numeric totals are correct.
// ─────────────────────────────────────────────────────────────────────────────
function sanitiseCharge(charge) {
  const qty = Number(charge.quantity) || 1;
  const price = Number(charge.price) || 0;
  return {
    category: (charge.category || "Labour").trim(),
    description: (charge.description || "").trim(),
    quantity: qty,
    price,
    total: charge.total !== undefined ? Number(charge.total) : qty * price,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/quotations/my
// ─────────────────────────────────────────────────────────────────────────────
router.get("/my", protect, async (req, res) => {
  try {
    const quotations = await Quotation.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, quotations });
  } catch (err) {
    console.error("[GET /quotations/my]", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your quotations",
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/quotations/search/:clientName
// ─────────────────────────────────────────────────────────────────────────────
router.get("/search/:clientName", async (req, res) => {
  try {
    const quotations = await Quotation.find({
      "customer.companyName": { $regex: req.params.clientName, $options: "i" },
    }).sort({ createdAt: -1 });
    res.json({ success: true, count: quotations.length, data: quotations });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to search quotations",
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/quotations/number/:quoteNumber
// ─────────────────────────────────────────────────────────────────────────────
router.get("/number/:quoteNumber", async (req, res) => {
  try {
    const quotation = await Quotation.findOne({
      quoteNumber: req.params.quoteNumber,
    });
    if (!quotation)
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    res.json({ success: true, data: quotation });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch quotation",
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/quotations  — admin only
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const quotations = await Quotation.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email phone")
      .lean();
    res.json({
      success: true,
      count: quotations.length,
      quotations,
      data: quotations,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch quotations",
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/quotations/:id  — admin or owner
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id", protect, async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate("userId", "name email phone")
      .lean();
    if (!quotation)
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });

    const isOwner =
      quotation.userId &&
      (quotation.userId._id?.toString() === req.user._id.toString() ||
        quotation.userId.toString() === req.user._id.toString());

    if (req.user.role !== "admin" && !isOwner)
      return res.status(403).json({ success: false, message: "Access denied" });

    res.json({ success: true, data: quotation });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch quotation",
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/quotations  — public (guests and logged-in users)
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const {
      customer,
      items,
      additionalCharges, // ← NEW
      total,
      notes,
      userId: bodyUserId,
    } = req.body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!customer?.companyName || !customer?.contactName || !customer?.email) {
      return res.status(400).json({
        success: false,
        message:
          "customer.companyName, customer.contactName and customer.email are required",
      });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "items array is required and must not be empty",
      });
    }
    if (total === undefined || total === null) {
      return res
        .status(400)
        .json({ success: false, message: "total is required" });
    }

    // ── Sanitise product items ────────────────────────────────────────────────
    const sanitisedItems = items.map((item) => ({
      productId: item._id || item.productId || undefined,
      name: item.name,
      price: Number(item.price),
      qty: Number(item.qty),
      subtotal: item.subtotal ?? Number(item.price) * Number(item.qty),
      imageUrl: item.imageUrl || "",
      unit: item.unit || "pcs",
    }));

    // ── Sanitise additional charges (labour, transport, etc.) ─────────────────
    const sanitisedCharges = Array.isArray(additionalCharges)
      ? additionalCharges.map(sanitiseCharge)
      : [];

    // ── Derive stored totals ──────────────────────────────────────────────────
    const itemsSubtotal = sanitisedItems.reduce((s, i) => s + i.subtotal, 0);
    const additionalTotal = sanitisedCharges.reduce((s, c) => s + c.total, 0);

    // ── Resolve userId ────────────────────────────────────────────────────────
    const resolvedUserId = bodyUserId || resolveUserIdFromToken(req) || null;

    const quotation = new Quotation({
      customer,
      items: sanitisedItems,
      additionalCharges: sanitisedCharges, // ← NEW
      total: Number(total),
      itemsSubtotal, // ← NEW (stored for admin reporting)
      additionalTotal, // ← NEW
      notes: notes || "",
      userId: resolvedUserId,
    });

    await quotation.save();

    res.status(201).json({
      success: true,
      message: "Quotation saved successfully",
      data: quotation,
    });
  } catch (err) {
    console.error("[POST /api/quotations]", err);
    res.status(500).json({
      success: false,
      message: "Failed to save quotation",
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/quotations/:id  — admin only (status + adminNotes)
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const update = {};
    if (status) update.status = status;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;

    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    ).populate("userId", "name email phone");

    if (!quotation)
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });

    res.json({ success: true, message: "Quotation updated", data: quotation });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update quotation",
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/quotations/:id  — full replace (admin only)
// ─────────────────────────────────────────────────────────────────────────────
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!quotation)
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    res.json({
      success: true,
      message: "Quotation updated successfully",
      data: quotation,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update quotation",
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/quotations/:id  — admin only
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation)
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    res.json({ success: true, message: "Quotation deleted successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete quotation",
      error: err.message,
    });
  }
});

module.exports = router;
