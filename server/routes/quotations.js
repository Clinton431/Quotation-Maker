const express = require("express");
const router = express.Router();
const Quotation = require("../models/Quotation");

// POST /api/quotations
router.post("/", async (req, res) => {
  try {
    const existing = await Quotation.findOne({
      quotationNumber: req.body.quotationNumber,
    });
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Quotation number already exists. Please generate a new one.",
        });
    }
    const quotation = new Quotation(req.body);
    await quotation.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Quotation saved successfully",
        data: quotation,
      });
  } catch (err) {
    console.error("Error saving quotation:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to save quotation",
        error: err.message,
      });
  }
});

// GET /api/quotations
router.get("/", async (req, res) => {
  try {
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    res.json({ success: true, count: quotations.length, data: quotations });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch quotations",
        error: err.message,
      });
  }
});

// GET /api/quotations/search/:clientName  — must come before /:id
router.get("/search/:clientName", async (req, res) => {
  try {
    const quotations = await Quotation.find({
      "clientInfo.name": { $regex: req.params.clientName, $options: "i" },
    }).sort({ createdAt: -1 });
    res.json({ success: true, count: quotations.length, data: quotations });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to search quotations",
        error: err.message,
      });
  }
});

// GET /api/quotations/number/:quotationNumber  — must come before /:id
router.get("/number/:quotationNumber", async (req, res) => {
  try {
    const quotation = await Quotation.findOne({
      quotationNumber: req.params.quotationNumber,
    });
    if (!quotation)
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    res.json({ success: true, data: quotation });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch quotation",
        error: err.message,
      });
  }
});

// GET /api/quotations/:id
router.get("/:id", async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation)
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    res.json({ success: true, data: quotation });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch quotation",
        error: err.message,
      });
  }
});

// PUT /api/quotations/:id
router.put("/:id", async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
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
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update quotation",
        error: err.message,
      });
  }
});

// DELETE /api/quotations/:id
router.delete("/:id", async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation)
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });
    res.json({ success: true, message: "Quotation deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete quotation",
        error: err.message,
      });
  }
});

module.exports = router;
