import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";
import multer from "multer";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

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

// 🔥 FALLBACK ANALYSIS
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

// File upload setup
const upload = multer({
  storage: multer.memoryStorage(),
});

// 🔥 TEXT ANALYSIS
app.post("/analyze", async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "Resume text is required" });
    }

    try {
      const response = await openai.responses.create({
        model: "gpt-4o-mini",
        input: `Analyze this resume and give improvement suggestions:\n\n${resumeText}`
      });

      return res.json({
        success: true,
        source: "AI",
        result: response.output[0].content[0].text,
      });

    } catch (error) {
      console.log("OpenAI failed → using fallback");

      const result = analyzeResumeLocally(resumeText);

      return res.json({
        success: true,
        source: "Fallback",
        result,
      });
    }

  } catch (error) {
    console.error("Analyze Error ❌:", error);

    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// 🔥 PDF UPLOAD (FINAL FIXED VERSION)
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    console.log("📂 Upload request received");

    if (!req.file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    console.log("📄 File:", req.file.originalname);

    let text = "";

    try {
      const pdfData = await pdfParse(req.file.buffer);
      text = pdfData.text;
      console.log("✅ PDF parsed");
    } catch (err) {
      console.log("❌ PDF parse error:", err.message);

      return res.status(500).json({
        success: false,
        error: "Failed to read PDF. Try another file.",
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
