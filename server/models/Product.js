// server/models/Product.js
// Added: images[] array for additional product photos

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "pcs", trim: true },
    category: { type: String, trim: true },
    stockStatus: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      default: "In Stock",
    },
    // Primary / cover image (existing)
    imageUrl: { type: String, default: "" },
    cloudinaryId: { type: String, default: "" },

    // ── NEW: additional gallery images ──────────────────────────────────────
    // Each entry: { url: String, cloudinaryId: String }
    images: [
      {
        url: { type: String, required: true },
        cloudinaryId: { type: String, default: "" },
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
