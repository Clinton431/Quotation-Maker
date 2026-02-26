const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ── CORS ──
// Hardcoded list — works in both local dev and Render/Vercel prod.
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://quotation-maker-wine.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow no-origin requests (Postman, curl, Render health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn(`[CORS] Blocked origin: ${origin}`);
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight for all routes
app.options("*", cors());

// ── Body parser ──
app.use(express.json({ limit: "10mb" }));

// ── MongoDB ──
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/quotation-maker";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    // Don't crash — let health check report the status
  });

// ── Routes ──
app.use("/api/companies", require("./routes/companies"));
app.use("/api/quotations", require("./routes/quotations"));
app.use("/api/delivery-notes", require("./routes/deliveryNotes"));

// ── Health check ──
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    env: process.env.NODE_ENV || "development",
    mongodb:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// ── Global error handler ──
// Catches CORS errors and any unhandled route errors, returns JSON not HTML
app.use((err, req, res, next) => {
  console.error("[Error]", err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// ── Start ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Allowed origins: ${allowedOrigins.join(", ")}`);
});
