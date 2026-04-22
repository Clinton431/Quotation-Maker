// server/middleware/upload.js
// Added: productUpload.array("images", 5) for multi-image gallery uploads.
// Everything else is unchanged.

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Logo uploads (company logos)
const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "company-logos",
    allowed_formats: ["jpg", "jpeg", "png", "svg", "webp"],
    transformation: [
      { width: 300, height: 300, crop: "limit", quality: "auto" },
    ],
  },
});

// Product image uploads
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "wimwa-products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 800, height: 800, crop: "limit", quality: "auto:good" },
    ],
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPG, PNG, SVG and WebP images are allowed"), false);
};

const limits = { fileSize: 5 * 1024 * 1024 }; // 5 MB

const upload = multer({ storage: logoStorage, limits, fileFilter });
const productUpload = multer({ storage: productStorage, limits, fileFilter });

module.exports = { upload, productUpload, cloudinary };
