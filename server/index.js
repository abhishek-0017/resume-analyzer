import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";
import multer from "multer";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error ❌:", err));

// OpenAI (optional)
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Home route
app.get("/", (req, res) => {
  res.send("API running 🚀");
});

// 🔥 LOCAL ANALYSIS
function analyzeResumeLocally(text) {
  let suggestions = [];

  if (!text.toLowerCase().includes("project")) {
    suggestions.push("Add at least 2-3 strong projects.");
  }

  if (!text.toLowerCase().includes("skill")) {
    suggestions.push("Include a dedicated skills section.");
  }

  if (!text.toLowerCase().includes("experience")) {
    suggestions.push("Add internships or practical experience.");
  }

  if (text.length < 100) {
    suggestions.push("Resume content is too short. Add more details.");
  }

  if (suggestions.length === 0) {
    suggestions.push("Your resume looks good. Improve formatting and achievements.");
  }

  return suggestions.join(" ");
}

// Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

// 🔥 FUNCTION TO READ PDF
async function extractTextFromPDF(buffer) {
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const strings = content.items.map(item => item.str);
    text += strings.join(" ");
  }

  return text;
}

// 🔥 TEXT ANALYSIS
app.post("/analyze", async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "Resume text is required" });
    }

    const result = analyzeResumeLocally(resumeText);

    return res.json({
      success: true,
      result,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// 🔥 PDF UPLOAD (FINAL FIXED)
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    console.log("📂 Upload request received");

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    console.log("📄 File:", req.file.originalname);

    let text = "";

    try {
      text = await extractTextFromPDF(req.file.buffer);
      console.log("✅ PDF parsed successfully");
    } catch (err) {
      console.log("❌ PDF parse error:", err.message);

      return res.status(500).json({
        success: false,
        error: "Failed to read PDF",
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
      error: "Server error in upload",
    });
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
