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

// 🔥 ANALYSIS FUNCTION
function analyzeResume(text, jobDesc = "") {
  let score = 0;
  let feedback = [];

  text = text.toLowerCase();
  jobDesc = jobDesc.toLowerCase();

  // ATS SCORE
  if (text.includes("project")) score += 25;
  else feedback.push("❌ Add projects");

  if (text.length > 300) score += 25;
  else feedback.push("❌ Resume too short");

  if (text.includes("experience")) score += 25;
  else feedback.push("❌ Add experience");

  if (text.includes("skill")) score += 25;
  else feedback.push("❌ Add skills");

  // JOB MATCHING
  let matchCount = 0;
  let missing = [];

  const relevantKeywords = keywords.filter(word =>
    jobDesc.includes(word)
  );

  relevantKeywords.forEach(word => {
    if (text.includes(word)) matchCount++;
    else missing.push(word);
  });

  const matchPercent =
    relevantKeywords.length > 0
      ? Math.round((matchCount / relevantKeywords.length) * 100)
      : 0;

  return {
    score,
    feedback: feedback.join("\n"),
    matchPercent,
    missing
  };
}

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend working");
});

// TEXT ROUTE
app.post("/analyze-text", (req, res) => {
  try {
    const { text, jobDesc } = req.body;
    const result = analyzeResume(text, jobDesc);
    res.json(result);
  } catch {
    res.status(500).json({ error: "Text failed" });
  }
});

// PDF ROUTE (🔥 IMPORTANT FIXED)
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
