import express from "express";
import cors from "cors";
import multer from "multer";
import pdfParse from "pdf-parse";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ---------- MULTER FIX ---------- */
const upload = multer({ storage: multer.memoryStorage() });

/* ---------- ANALYZE FUNCTION ---------- */
function analyzeResume(text) {
  const score = Math.min(100, Math.floor(text.length / 10));

  let suggestions = [];

  if (!text.toLowerCase().includes("skill")) {
    suggestions.push("Add a Skills section");
  }
  if (!text.toLowerCase().includes("project")) {
    suggestions.push("Add Projects section");
  }
  if (!text.toLowerCase().includes("experience")) {
    suggestions.push("Add Experience section");
  }

  return {
    score,
    suggestions,
  };
}

/* ---------- REWRITE FUNCTION ---------- */
function rewriteResume(text) {
  return `
Professional Summary:

${text
  .replace(/i am/gi, "Results-driven")
  .replace(/skilled in/gi, "with expertise in")
  .replace(/student/gi, "graduate")
  .replace(/\./g, ", focused on delivering high-quality solutions.")}

Enhanced Version:
This resume has been optimized to improve clarity, impact, and ATS compatibility.
`;
}

/* ---------- PDF UPLOAD (FIXED) ---------- */
app.post("/upload", upload.any(), async (req, res) => {
  try {
    console.log("📂 Upload request received");

    const file = req.files[0];

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const data = await pdfParse(file.buffer);
    const text = data.text;

    console.log("📄 PDF parsed successfully");

    const result = analyzeResume(text);

    res.json({
      text,
      analysis: result,
    });
  } catch (err) {
    console.error("❌ PDF ERROR:", err);
    res.status(500).json({ error: "PDF processing failed" });
  }
});

/* ---------- TEXT ANALYSIS ---------- */
app.post("/analyze-text", (req, res) => {
  try {
    const { text } = req.body;

    const result = analyzeResume(text);

    res.json({
      analysis: result,
    });
  } catch (err) {
    res.status(500).json({ error: "Text analysis failed" });
  }
});

/* ---------- REWRITE ROUTE ---------- */
app.post("/rewrite", (req, res) => {
  try {
    const { text } = req.body;

    const improved = rewriteResume(text);

    res.json({
      analysis: improved,
    });
  } catch (err) {
    res.status(500).json({ error: "Rewrite failed" });
  }
});

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
