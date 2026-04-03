const express = require("express");
const multer = require("multer");
const cors = require("cors");
const pdfParse = require("pdf-parse");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Multer setup
const upload = multer({ storage: multer.memoryStorage() });

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ TEXT ANALYSIS
app.post("/analyze-text", (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const wordCount = text.trim().split(/\s+/).length;

    res.json({
      success: true,
      message: "Text analyzed successfully",
      wordCount: wordCount,
      preview: text.substring(0, 200),
    });
  } catch (error) {
    res.status(500).json({ error: "Error analyzing text" });
  }
});

// ✅ PDF ANALYSIS (IMPORTANT: field name = file)
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const data = await pdfParse(req.file.buffer);

    res.json({
      success: true,
      message: "PDF analyzed successfully",
      text: data.text.substring(0, 500),
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
