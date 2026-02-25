const mongoose = require("mongoose");

const deliveryNoteSchema = new mongoose.Schema(
  {
    deliveryNoteNumber: { type: String, required: true },
    date: String,
    company: { type: mongoose.Schema.Types.Mixed }, // full company object snapshot
    clientInfo: {
      name: String,
      address: String,
      phone: String,
      email: String,
    },
    shipTo: { type: String, default: "" },
    items: [
      {
        description: String,
        quantity: Number,
        unit: { type: String, enum: ["pcs", "kgs"], default: "pcs" },
        remarks: { type: String, default: "" },
      },
    ],
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeliveryNote", deliveryNoteSchema);
