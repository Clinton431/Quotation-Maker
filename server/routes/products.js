// server/routes/products.js
// Changes from original:
//   1. POST /upload-images  — NEW: upload up to 5 gallery images at once
//   2. POST /              — saves images[] array from req.body
//   3. PUT  /:id           — merges/replaces images[] array
//   4. DELETE /:id         — also destroys gallery images from Cloudinary
// Everything else is identical to the original.

const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");
const { productUpload, cloudinary } = require("../middleware/upload");

// ── GET all products (public) ─────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /upload-image  — single cover image (existing, unchanged) ────────────
router.post(
  "/upload-image",
  protect,
  adminOnly,
  productUpload.single("image"),
  (req, res) => {
    try {
      if (!req.file)
        return res
          .status(400)
          .json({ success: false, message: "No image provided" });
      res.json({
        success: true,
        url: req.file.path,
        imageUrl: req.file.path,
        cloudinaryId: req.file.filename,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── POST /upload-images — NEW: upload up to 5 gallery images at once ──────────
// Field name: "images" (array). Returns array of { url, cloudinaryId }.
router.post(
  "/upload-images",
  protect,
  adminOnly,
  productUpload.array("images", 5),
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0)
        return res
          .status(400)
          .json({ success: false, message: "No images provided" });

      const uploaded = req.files.map((f) => ({
        url: f.path,
        cloudinaryId: f.filename,
      }));

      res.json({ success: true, images: uploaded });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── POST /  — create product (admin) ─────────────────────────────────────────
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      unit,
      category,
      stockStatus,
      imageUrl,
      cloudinaryId,
      images,
    } = req.body;

    if (!name || price === undefined)
      return res
        .status(400)
        .json({ success: false, message: "Name and price are required" });

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      unit,
      category,
      stockStatus,
      imageUrl: imageUrl || "",
      cloudinaryId: cloudinaryId || "",
      images: Array.isArray(images) ? images : [],
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /:id — single product (public) ────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /:id — update product (admin) ─────────────────────────────────────────
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      unit,
      category,
      stockStatus,
      imageUrl,
      cloudinaryId,
      images,
    } = req.body;

    const updateData = {
      name,
      description,
      price: Number(price),
      unit,
      category,
      stockStatus,
      imageUrl,
      cloudinaryId,
    };

    if (Array.isArray(images)) updateData.images = images;

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /:id — delete product + all its Cloudinary assets (admin) ──────────
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    if (product.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(product.cloudinaryId);
      } catch (e) {
        /* ignore */
      }
    }

    if (product.images?.length) {
      await Promise.allSettled(
        product.images
          .filter((img) => img.cloudinaryId)
          .map((img) => cloudinary.uploader.destroy(img.cloudinaryId))
      );
    }

    await product.deleteOne();
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
