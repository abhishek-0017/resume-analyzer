const express = require("express");
const multer = require("multer");
const cors = require("cors");
const pdfParse = require("pdf-parse");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// ✅ FAKE AI FUNCTION (WORKS ALWAYS)
function generateFeedback(text) {
  let feedback = "";

  if (text.toLowerCase().includes("project")) {
    feedback += "✅ Good: You have mentioned projects.\n";
  } else {
    feedback += "❌ Add projects section.\n";
  }

  if (text.length > 300) {
    feedback += "✅ Resume length is good.\n";
  } else {
    feedback += "❌ Resume is too short.\n";
  }

  if (text.toLowerCase().includes("python")) {
    feedback += "✅ Python skill detected.\n";
  } else {
    feedback += "❌ Add technical skills like Python.\n";
  }

  feedback += "\n⭐ Suggestion:\nAdd measurable achievements and improve formatting.";

  return feedback;
}

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend working perfectly 🚀");
});

// ✅ TEXT ANALYSIS
app.post("/analyze-text", (req, res) => {
  try {
    const { text } = req.body;

    const feedback = generateFeedback(text);

    res.json({
      success: true,
      aiFeedback: feedback,
    });
  } catch (error) {
    res.status(500).json({ error: "Text analysis failed" });
  }
});

// ✅ PDF ANALYSIS
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const data = await pdfParse(req.file.buffer);

    const feedback = generateFeedback(data.text);

    res.json({
      success: true,
      aiFeedback: feedback,
    });
  } catch (error) {
    res.status(500).json({ error: "PDF analysis failed" });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
