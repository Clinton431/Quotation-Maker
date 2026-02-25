const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ── Middleware ──
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://quotation-maker-wine.vercel.app/",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));

// ── MongoDB ──
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/quotation-maker";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ── Routes ──
app.use("/api/companies", require("./routes/companies"));
app.use("/api/quotations", require("./routes/quotations"));
app.use("/api/delivery-notes", require("./routes/deliveryNotes"));

// ── Health check ──
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    mongodb:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API at http://localhost:${PORT}/api`);
});
