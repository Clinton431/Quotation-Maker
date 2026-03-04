const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");
const { productUpload, cloudinary } = require("../middleware/upload");

// GET /api/products — public
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

// POST /api/products/upload-image — MUST be before /:id routes
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
        url: req.file.path, //  this is what ImageUploader expects
        imageUrl: req.file.path, // extra compatibility
        cloudinaryId: req.file.filename,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// POST /api/products — admin only, create
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
    });
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:id — public (after static POST routes)
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

// PUT /api/products/:id — admin only, update
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
    } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price: Number(price),
        unit,
        category,
        stockStatus,
        imageUrl,
        cloudinaryId,
      },
      { new: true, runValidators: true }
    );
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/:id — admin only
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

    await product.deleteOne();
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
