const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: { type: String, required: true, unique: true },
    date: { type: String, required: true },
    companyInfo: {
      name: String,
      address: String,
      phone: String,
      email: String,
      pvt: String,
    },
    clientInfo: {
      name: { type: String, required: true },
      address: String,
      phone: String,
      email: String,
    },
    items: [
      {
        description: String,
        quantity: Number,
        price: Number,
        total: Number,
      },
    ],
    subtotal: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quotation", quotationSchema);
