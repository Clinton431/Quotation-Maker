const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    shortName: { type: String, trim: true },
    address: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true },
    pvt: { type: String, default: "", trim: true },
    logoUrl: { type: String, default: "" }, // Cloudinary secure URL
    logoPublicId: { type: String, default: "" }, // Cloudinary public_id for deletion
    logoInitials: { type: String, default: "" }, // Auto-generated fallback
    logoColor: { type: String, default: "from-slate-600 to-slate-800" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
