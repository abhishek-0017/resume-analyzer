const express = require("express");
const multer = require("multer");
const cors = require("cors");
const pdfParse = require("pdf-parse");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// File upload setup
const upload = multer({ storage: multer.memoryStorage() });

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// 🔥 FUNCTION: ATS CALCULATION
function calculateATS(text) {
  const keywords = [
    "python",
    "java",
    "react",
    "node",
    "sql",
    "mongodb",
    "machine learning",
    "data structures",
    "algorithms",
    "api",
  ];

  let score = 0;
  let foundKeywords = [];

  keywords.forEach((word) => {
    if (text.toLowerCase().includes(word)) {
      score += 10;
      foundKeywords.push(word);
    }
  });

  return {
    score: Math.min(score, 100),
    foundKeywords,
  };
}

// ✅ TEXT ANALYSIS WITH ATS
app.post("/analyze-text", (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const ats = calculateATS(text);

    res.json({
      success: true,
      message: "Text analyzed successfully",
      atsScore: ats.score,
      matchedKeywords: ats.foundKeywords,
      suggestions:
        ats.score < 50
          ? "Add more technical skills like Python, React, SQL, APIs"
          : "Good resume, but can still improve with more project details",
    });
  } catch (error) {
    res.status(500).json({ error: "Error analyzing text" });
  }
});

// ✅ PDF ANALYSIS WITH ATS
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const data = await pdfParse(req.file.buffer);
    const ats = calculateATS(data.text);

    res.json({
      success: true,
      message: "PDF analyzed successfully",
      atsScore: ats.score,
      matchedKeywords: ats.foundKeywords,
      suggestions:
        ats.score < 50
          ? "Improve your resume by adding key technical skills"
          : "Strong resume!",
      preview: data.text.substring(0, 300),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error analyzing PDF" });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
