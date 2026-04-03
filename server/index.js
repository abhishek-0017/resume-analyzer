const express = require("express");
const multer = require("multer");
const cors = require("cors");
const pdfParse = require("pdf-parse");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// ✅ ATS + FEEDBACK FUNCTION
function generateFeedback(text) {
  let score = 0;
  let feedback = [];

  if (text.toLowerCase().includes("project")) {
    score += 25;
    feedback.push("✅ Projects section is present");
  } else {
    feedback.push("❌ Add projects section");
  }

  if (text.length > 300) {
    score += 25;
    feedback.push("✅ Resume length is good");
  } else {
    feedback.push("❌ Resume is too short");
  }

  if (text.toLowerCase().includes("python")) {
    score += 25;
    feedback.push("✅ Python skill detected");
  } else {
    feedback.push("❌ Add technical skills like Python");
  }

  if (text.toLowerCase().includes("experience")) {
    score += 25;
    feedback.push("✅ Experience section found");
  } else {
    feedback.push("❌ Add experience section");
  }

  return {
    score,
    feedback: feedback.join("\n"),
  };
}

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend working 🚀");
});

// ✅ TEXT ANALYSIS
app.post("/analyze-text", (req, res) => {
  try {
    const { text } = req.body;

    const result = generateFeedback(text);

    res.json({
      success: true,
      score: result.score,
      feedback: result.feedback,
    });
  } catch (error) {
    res.status(500).json({ error: "Text analysis failed" });
  }
});

// ✅ PDF ANALYSIS
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const data = await pdfParse(req.file.buffer);

    const result = generateFeedback(data.text);

    res.json({
      success: true,
      score: result.score,
      feedback: result.feedback,
    });
  } catch (error) {
    res.status(500).json({ error: "PDF analysis failed" });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
