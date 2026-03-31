import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";
import multer from "multer";

// ✅ FIXED pdf-parse import
import pkg from "pdf-parse";
const pdfParse = pkg;

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error ❌:", err));

// OpenAI Setup
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Root Route
app.get("/", (req, res) => {
  res.send("API running 🚀");
});

// 🔥 FREE FALLBACK ANALYSIS
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
    suggestions.push("Your resume looks good. Try improving formatting and adding achievements.");
  }

  return suggestions.join(" ");
}

// File Upload Setup
const upload = multer({
  storage: multer.memoryStorage(),
});

// 🔥 TEXT ANALYSIS ROUTE
app.post("/analyze", async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "Resume text is required" });
    }

    try {
      // Try OpenAI
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
      console.log("OpenAI failed, using fallback...");

      const localResult = analyzeResumeLocally(resumeText);

      return res.json({
        success: true,
        source: "Fallback",
        result: localResult,
      });
    }

  } catch (error) {
    console.error("Server Error ❌:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// 🔥 PDF UPLOAD + ANALYSIS ROUTE
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text;

    const result = analyzeResumeLocally(text);

    res.json({
      success: true,
      extractedText: text.substring(0, 500),
      result: result,
    });

  } catch (error) {
    console.error("PDF Error ❌:", error);
    res.status(500).json({
      success: false,
      error: "PDF processing failed",
    });
  }
});

// START SERVER
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
