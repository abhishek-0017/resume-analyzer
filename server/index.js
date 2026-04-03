const express = require("express");
const multer = require("multer");
const cors = require("cors");
const pdfParse = require("pdf-parse");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// 🔥 COMMON KEYWORDS
const keywords = [
  "python", "java", "c++", "react", "node", "mongodb",
  "sql", "machine learning", "data structures",
  "algorithms", "communication", "teamwork"
];

// ✅ ANALYSIS FUNCTION
function analyzeResume(text, jobDesc = "") {
  let score = 0;
  let feedback = [];

  text = text.toLowerCase();
  jobDesc = jobDesc.toLowerCase();

  // Basic scoring
  if (text.includes("project")) score += 25;
  else feedback.push("❌ Add projects section");

  if (text.length > 300) score += 25;
  else feedback.push("❌ Resume too short");

  if (text.includes("experience")) score += 25;
  else feedback.push("❌ Add experience");

  if (text.includes("skill")) score += 25;
  else feedback.push("❌ Add skills section");

  // 🔥 JOB MATCHING
  let matchCount = 0;
  let missing = [];

  keywords.forEach((word) => {
    if (jobDesc.includes(word)) {
      if (text.includes(word)) {
        matchCount++;
      } else {
        missing.push(word);
      }
    }
  });

  const matchPercent = jobDesc
    ? Math.round((matchCount / keywords.length) * 100)
    : 0;

  return {
    score,
    feedback: feedback.join("\n"),
    matchPercent,
    missing,
  };
}

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// TEXT ANALYSIS
app.post("/analyze-text", (req, res) => {
  try {
    const { text, jobDesc } = req.body;

    const result = analyzeResume(text, jobDesc);

    res.json(result);
  } catch {
    res.status(500).json({ error: "Text analysis failed" });
  }
});

// PDF ANALYSIS
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const jobDesc = req.body.jobDesc || "";

    const data = await pdfParse(req.file.buffer);

    const result = analyzeResume(data.text, jobDesc);

    res.json(result);
  } catch {
    res.status(500).json({ error: "PDF analysis failed" });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
