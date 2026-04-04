const express = require("express");
const multer = require("multer");
const cors = require("cors");
const pdfParse = require("pdf-parse");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// 🔥 KEYWORDS
const keywords = [
  "python", "java", "c++", "react", "node", "mongodb",
  "sql", "machine learning", "data structures",
  "algorithms", "communication", "teamwork",
  "data", "analytics", "modeling", "warehouse",
  "etl", "big data", "cloud", "api"
];

// 🔥 IMPROVED ANALYSIS
function analyzeResume(text, jobDesc = "") {
  let score = 0;
  let feedback = [];

  text = text.toLowerCase();
  jobDesc = jobDesc.toLowerCase();

  // ✅ REALISTIC ATS SCORING
  if (text.includes("project")) score += 20;
  else feedback.push("❌ Add projects");

  if (text.includes("intern") || text.includes("experience")) score += 20;
  else feedback.push("❌ Add experience/internships");

  if (text.includes("skill")) score += 20;
  else feedback.push("❌ Add skills section");

  if (text.length > 500) score += 20;
  else feedback.push("❌ Resume too short");

  if (text.includes("education")) score += 20;
  else feedback.push("❌ Add education");

  // ✅ KEYWORD MATCHING
  let matchCount = 0;
  let missing = [];

  const relevantKeywords = keywords.filter(word =>
    jobDesc.includes(word)
  );

  // ⚠️ Handle weak job description
  if (relevantKeywords.length < 2) {
    return {
      score,
      feedback: "⚠️ Job description too vague",
      matchPercent: 0,
      missing: []
    };
  }

  relevantKeywords.forEach(word => {
    if (text.includes(word)) matchCount++;
    else missing.push(word);
  });

  const matchPercent = Math.round(
    (matchCount / relevantKeywords.length) * 100
  );

  return {
    score,
    feedback: feedback.join("\n"),
    matchPercent,
    missing,
    text // 🔥 send extracted text to frontend
  };
}

// TEST
app.get("/", (req, res) => {
  res.send("Backend working");
});

// TEXT
app.post("/analyze-text", (req, res) => {
  try {
    const { text, jobDesc } = req.body;
    const result = analyzeResume(text, jobDesc);
    res.json(result);
  } catch {
    res.status(500).json({ error: "Text failed" });
  }
});

// PDF
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const jobDesc = req.body.jobDesc || "";

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const data = await pdfParse(req.file.buffer);

    const result = analyzeResume(data.text, jobDesc);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "PDF failed" });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
