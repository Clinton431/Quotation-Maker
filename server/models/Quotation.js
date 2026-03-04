const mongoose = require("mongoose");

// ── Atomic counter — guarantees gap-free, collision-free quote numbers ─────────
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const Counter =
  mongoose.models.Counter || mongoose.model("Counter", counterSchema);

// ── Item sub-schema ────────────────────────────────────────────────────────────
const quotationItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: "" },
    unit: { type: String, default: "pcs" },
  },
  { _id: false }
);

// ── Additional Charge sub-schema (labour, transport, installation, etc.) ───────
const additionalChargeSchema = new mongoose.Schema(
  {
    // e.g. "Labour", "Transport", "Installation", "Consultation", "Other"
    category: { type: String, required: true, trim: true, default: "Labour" },
    description: { type: String, trim: true, default: "" },
    quantity: { type: Number, required: true, min: 0, default: 1 },
    price: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
);

// ── Customer sub-schema ────────────────────────────────────────────────────────
const customerSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: "" },
    deliveryAddress: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

// ── Main Quotation schema ──────────────────────────────────────────────────────
const quotationSchema = new mongoose.Schema(
  {
    // ── Quote reference  e.g. "WTQ-0001" ─────────────────────────────────────
    quoteNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    // ── Linked account (null for guests) ─────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    customer: { type: customerSchema, required: true },

    items: {
      type: [quotationItemSchema],
      required: true,
      validate: [(v) => v.length > 0, "At least one item is required"],
    },

    // ── NEW: non-product charges (labour, transport, installation, etc.) ──────
    additionalCharges: {
      type: [additionalChargeSchema],
      default: [],
    },

    total: { type: Number, required: true, min: 0 },

    // ── Derived totals (stored for quick reporting / admin views) ─────────────
    itemsSubtotal: { type: Number, min: 0, default: 0 },
    additionalTotal: { type: Number, min: 0, default: 0 },

    notes: { type: String, trim: true, default: "" },

    status: {
      type: String,
      enum: ["pending", "processing", "sent", "approved", "rejected"],
      default: "pending",
    },

    adminNotes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// ── Auto-generate quoteNumber via atomic counter ──────────────────────────────
quotationSchema.pre("save", async function (next) {
  if (this.quoteNumber) return next();
  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: "quotation" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.quoteNumber = `WTQ-${String(counter.seq).padStart(4, "0")}`;
  } catch (err) {
    console.error("[Quotation] quoteNumber generation failed:", err.message);
  }
  next();
});

module.exports = mongoose.model("Quotation", quotationSchema);
