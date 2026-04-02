import express from "express";
import cors from "cors";
import multer from "multer";
import pdfParse from "pdf-parse";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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

/* ---------- JOB MATCHING FUNCTION ---------- */
function matchJobs(text) {
  const lower = text.toLowerCase();

  let jobs = [];

  if (lower.includes("react") || lower.includes("html") || lower.includes("css")) {
    jobs.push({ role: "Frontend Developer", match: 85 });
  }

  if (lower.includes("node") || lower.includes("express") || lower.includes("mongodb")) {
    jobs.push({ role: "Backend Developer", match: 80 });
  }

  if (lower.includes("python") || lower.includes("pandas") || lower.includes("analysis")) {
    jobs.push({ role: "Data Analyst", match: 75 });
  }

  if (jobs.length === 0) {
    jobs.push({ role: "General Software Engineer", match: 60 });
  }

  return jobs;
}

/* ---------- PDF UPLOAD ---------- */
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
    const jobs = matchJobs(text);

    res.json({
      text,
      analysis: result,
      jobs,
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
    const jobs = matchJobs(text);

    res.json({
      analysis: result,
      jobs,
    });
  } catch (err) {
    res.status(500).json({ error: "Text analysis failed" });
  }
});

/* ---------- REWRITE ---------- */
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
