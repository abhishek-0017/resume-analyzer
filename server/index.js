import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";

import pdfParse from "pdf-parse/lib/pdf-parse.js"; // ✅ CORRECT FIX

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

// MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error ❌:", err));

// Home route
app.get("/", (req, res) => {
  res.send("API running 🚀");
});

// Resume analyzer
function analyzeResumeLocally(text) {
  let suggestions = [];

  if (!text.toLowerCase().includes("project")) {
    suggestions.push("Add at least 2-3 strong projects.");
  }

  if (!text.toLowerCase().includes("skill")) {
    suggestions.push("Include a skills section.");
  }

  if (!text.toLowerCase().includes("experience")) {
    suggestions.push("Add internships or experience.");
  }

  if (text.length < 100) {
    suggestions.push("Resume content is too short.");
  }

  if (suggestions.length === 0) {
    suggestions.push("Resume looks good. Improve formatting.");
  }

  return suggestions.join(" ");
}

// Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

// 🔥 FINAL PDF ROUTE
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    console.log("📂 Upload request received");

    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    console.log("📄 File:", req.file.originalname);

    let text = "";

    try {
      const data = await pdfParse(req.file.buffer);
      text = data.text;
      console.log("✅ PDF parsed successfully");
    } catch (err) {
      console.log("❌ PDF parse error:", err.message);

      return res.status(500).json({
        success: false,
        error: "Failed to parse PDF",
      });
    }

    if (!text || text.length < 20) {
      return res.status(400).json({
        success: false,
        error: "PDF has no readable content",
      });
    }

    const result = analyzeResumeLocally(text);

    return res.json({
      success: true,
      result,
    });

  } catch (error) {
    console.error("🔥 Upload Error:", error);

    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
