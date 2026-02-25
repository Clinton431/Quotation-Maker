const express = require("express");
const router = express.Router();
const DeliveryNote = require("../models/DeliveryNote");

// POST /api/delivery-notes
router.post("/", async (req, res) => {
  try {
    const note = new DeliveryNote(req.body);
    await note.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Delivery note saved successfully",
        data: note,
      });
  } catch (err) {
    console.error("Error saving delivery note:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to save delivery note",
        error: err.message,
      });
  }
});

// GET /api/delivery-notes
router.get("/", async (req, res) => {
  try {
    const notes = await DeliveryNote.find().sort({ createdAt: -1 });
    res.json({ success: true, count: notes.length, data: notes });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch delivery notes",
        error: err.message,
      });
  }
});

// GET /api/delivery-notes/:id
router.get("/:id", async (req, res) => {
  try {
    const note = await DeliveryNote.findById(req.params.id);
    if (!note)
      return res
        .status(404)
        .json({ success: false, message: "Delivery note not found" });
    res.json({ success: true, data: note });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch delivery note",
        error: err.message,
      });
  }
});

// DELETE /api/delivery-notes/:id
router.delete("/:id", async (req, res) => {
  try {
    const note = await DeliveryNote.findByIdAndDelete(req.params.id);
    if (!note)
      return res
        .status(404)
        .json({ success: false, message: "Delivery note not found" });
    res.json({ success: true, message: "Delivery note deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete delivery note",
        error: err.message,
      });
  }
});

module.exports = router;
