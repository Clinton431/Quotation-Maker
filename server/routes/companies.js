const express = require("express");
const router = express.Router();
const Company = require("../models/Company");
const { upload, cloudinary } = require("../middleware/upload");

// ── Helper: build initials from company name ──
const getInitials = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

// GET /api/companies — fetch all companies
router.get("/", async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json(companies);
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch companies",
        error: err.message,
      });
  }
});

// GET /api/companies/:id — fetch single company
router.get("/:id", async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company)
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    res.json({ success: true, data: company });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch company",
        error: err.message,
      });
  }
});

// POST /api/companies — create company with optional logo upload
router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const { name, shortName, address, phone, email, pvt, logoColor } = req.body;

    if (!name?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Company name is required" });
    }

    const company = new Company({
      name: name.trim(),
      shortName:
        shortName?.trim() || name.trim().split(" ").slice(0, 2).join(" "),
      address: address?.trim() || "",
      phone: phone?.trim() || "",
      email: email?.trim() || "",
      pvt: pvt?.trim() || "",
      logoInitials: getInitials(name.trim()),
      logoColor: logoColor || "from-slate-600 to-slate-800",
      logoUrl: req.file ? req.file.path : "",
      logoPublicId: req.file ? req.file.filename : "",
    });

    await company.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Company created successfully",
        data: company,
      });
  } catch (err) {
    console.error("Error creating company:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create company",
        error: err.message,
      });
  }
});

// PUT /api/companies/:id — update company, optionally replace logo
router.put("/:id", upload.single("logo"), async (req, res) => {
  try {
    const existing = await Company.findById(req.params.id);
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });

    const updates = { ...req.body };

    if (req.file) {
      // Remove old logo from Cloudinary
      if (existing.logoPublicId) {
        await cloudinary.uploader
          .destroy(existing.logoPublicId)
          .catch(() => {});
      }
      updates.logoUrl = req.file.path;
      updates.logoPublicId = req.file.filename;
    }

    // Regenerate initials if name changed
    if (req.body.name) {
      updates.logoInitials = getInitials(req.body.name.trim());
    }

    const company = await Company.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    res.json({
      success: true,
      message: "Company updated successfully",
      data: company,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update company",
        error: err.message,
      });
  }
});

// DELETE /api/companies/:id — delete company + its Cloudinary logo
router.delete("/:id", async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company)
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });

    if (company.logoPublicId) {
      await cloudinary.uploader.destroy(company.logoPublicId).catch(() => {});
    }

    res.json({ success: true, message: "Company deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete company",
        error: err.message,
      });
  }
});

module.exports = router;
