const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/quotation-maker";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Quotation Schema
const quotationSchema = new mongoose.Schema({
  quotationNumber: {
    type: String,
    required: true,
    unique: true,
  },
  date: {
    type: String,
    required: true,
  },
  companyInfo: {
    name: String,
    address: String,
    phone: String,
    email: String,
    pvt: String,
  },
  clientInfo: {
    name: {
      type: String,
      required: true,
    },
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
  subtotal: {
    type: Number,
    required: true,
  },
  grandTotal: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Quotation = mongoose.model("Quotation", quotationSchema);

// Routes

// Create a new quotation
app.post("/api/quotations", async (req, res) => {
  try {
    const quotationData = req.body;

    // Check if quotation number already exists
    const existingQuotation = await Quotation.findOne({
      quotationNumber: quotationData.quotationNumber,
    });

    if (existingQuotation) {
      return res.status(400).json({
        success: false,
        message: "Quotation number already exists. Please generate a new one.",
      });
    }

    const quotation = new Quotation(quotationData);
    await quotation.save();

    res.status(201).json({
      success: true,
      message: "Quotation saved successfully",
      data: quotation,
    });
  } catch (error) {
    console.error("Error saving quotation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save quotation",
      error: error.message,
    });
  }
});

// Get all quotations
app.get("/api/quotations", async (req, res) => {
  try {
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: quotations.length,
      data: quotations,
    });
  } catch (error) {
    console.error("Error fetching quotations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quotations",
      error: error.message,
    });
  }
});

// Get a single quotation by ID
app.get("/api/quotations/:id", async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    res.json({
      success: true,
      data: quotation,
    });
  } catch (error) {
    console.error("Error fetching quotation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quotation",
      error: error.message,
    });
  }
});

// Get quotation by quotation number
app.get("/api/quotations/number/:quotationNumber", async (req, res) => {
  try {
    const quotation = await Quotation.findOne({
      quotationNumber: req.params.quotationNumber,
    });

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    res.json({
      success: true,
      data: quotation,
    });
  } catch (error) {
    console.error("Error fetching quotation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quotation",
      error: error.message,
    });
  }
});

// Update a quotation
app.put("/api/quotations/:id", async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    res.json({
      success: true,
      message: "Quotation updated successfully",
      data: quotation,
    });
  } catch (error) {
    console.error("Error updating quotation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update quotation",
      error: error.message,
    });
  }
});

// Delete a quotation
app.delete("/api/quotations/:id", async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    res.json({
      success: true,
      message: "Quotation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting quotation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete quotation",
      error: error.message,
    });
  }
});

// Search quotations by client name
app.get("/api/quotations/search/:clientName", async (req, res) => {
  try {
    const quotations = await Quotation.find({
      "clientInfo.name": { $regex: req.params.clientName, $options: "i" },
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: quotations.length,
      data: quotations,
    });
  } catch (error) {
    console.error("Error searching quotations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search quotations",
      error: error.message,
    });
  }
});

// Health check route
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
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
});
