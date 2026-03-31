import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";
import multer from "multer";

// dynamic import workaround for pdfjs-dist
async function loadPDFJS() {
  const pdfjs = await import("pdfjs-dist");
  return pdfjs.getDocument;
}

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

// OpenAI optional
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// fallback text analyzer
function analyzeResumeLocally(text) {
  let suggestions = [];

  if (!text.toLowerCase().includes("project")) {
    suggestions.push("Add at least 2–3 strong projects.");
  }
  if (!text.toLowerCase().includes("skill")) {
    suggestions.push("Include a dedicated skills section.");
  }
  if (!text.toLowerCase().includes("experience")) {
    suggestions.push("Add practical work or internships.");
  }
  if (text.length < 100) {
    suggestions.push("Resume content seems short — expand it.");
  }
  if (suggestions.length === 0) {
    suggestions.push("Looks good! Maybe add quantified achievements.");
  }

  return suggestions.join(" ");
}

// multer setup
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// simple text analysis route
app.post("/analyze", async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: "Resume text required" });
    }
    // just fallback local for now
    const result = analyzeResumeLocally(resumeText);
    return res.json({ success: true, result });
  } catch (err) {
    console.error("Analyze Error ❌", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// FINAL PDF UPLOAD ROUTE
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    // load pdfjs
    const getDocument = await loadPDFJS();

    // parse buffer
    const loadingTask = getDocument({ data: req.file.buffer });
    const pdf = await loadingTask.promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      text += strings.join(" ");
    }

    if (!text || text.length < 20) {
      return res.status(400).json({ success: false, error: "PDF has no readable content" });
    }

    // run fallback analysis
    const result = analyzeResumeLocally(text);

    return res.json({ success: true, result });

  } catch (err) {
    console.error("PDF Upload Error ❌", err);
    return res.status(500).json({ success: false, error: "Failed to parse PDF" });
  }
});

// start backend
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
