const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ── CORS ──
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://quotation-maker-wine.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
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

app.options("*", cors());

// ── Body parser ──
app.use(express.json({ limit: "10mb" }));

// ── MongoDB with auto-reconnect ──
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/quotation-maker";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    setTimeout(connectDB, 5000);
  }
};

mongoose.connection.once("open", async () => {
  // ── One-time cleanup: drop the stale quotationNumber_1 index ──────────────
  // This index was created by an older version of the schema that used
  // `quotationNumber` instead of `quoteNumber`. Because it is unique, any
  // document saved without that field collides on null and throws E11000.
  // Safe to run on every boot — if the index is already gone it just no-ops.
  try {
    await mongoose.connection
      .collection("quotations")
      .dropIndex("quotationNumber_1");
    console.log("🧹 Dropped stale quotationNumber_1 index from quotations");
  } catch (e) {
    if (e.codeName === "IndexNotFound" || e.code === 27) {
      // Already gone — nothing to do
    } else {
      console.warn("[index-cleanup] Unexpected error:", e.message);
    }
  }
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected — retrying in 5s...");
  setTimeout(connectDB, 5000);
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err.message);
});

connectDB();

// ── Routes ──
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/products", require("./routes/products"));
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

  if (
    process.env.NODE_ENV === "production" &&
    process.env.RENDER_EXTERNAL_URL
  ) {
    const PING_INTERVAL = 10 * 60 * 1000;
    const https = require("https");
    setInterval(() => {
      const url = `${process.env.RENDER_EXTERNAL_URL}/api/health`;
      https
        .get(url, (res) => {
          console.log(`[Keep-alive] Pinged ${url} — status ${res.statusCode}`);
        })
        .on("error", (e) => {
          console.warn("[Keep-alive] Ping failed:", e.message);
        });
    }, PING_INTERVAL);
    console.log("🔁 Keep-alive ping enabled (every 10 min)");
  }
});
