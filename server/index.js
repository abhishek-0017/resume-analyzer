import express from "express";
import cors from "cors";
import multer from "multer";
import pdfParse from "pdf-parse";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

// 🔹 TEXT ANALYSIS ROUTE
app.post("/analyze-text", (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    let suggestions = [];

    if (!text.toLowerCase().includes("project")) {
      suggestions.push("Add at least 2-3 strong projects.");
    }

    if (!text.toLowerCase().includes("skill")) {
      suggestions.push("Include a skills section.");
    }

    if (!text.toLowerCase().includes("experience")) {
      suggestions.push("Add internships or experience.");
    }

    res.json({
      analysis: suggestions.join(" "),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Text analysis failed" });
  }
});

// 🔹 PDF ANALYSIS ROUTE
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    console.log("📂 Upload request received");

    const pdfBuffer = req.file.buffer;
    const data = await pdfParse(pdfBuffer);

    console.log("📄 PDF parsed successfully");

    const text = data.text.toLowerCase();

    let suggestions = [];

    if (!text.includes("project")) {
      suggestions.push("Add at least 2-3 strong projects.");
    }

    if (!text.includes("skill")) {
      suggestions.push("Include a skills section.");
    }

    if (!text.includes("experience")) {
      suggestions.push("Add internships or experience.");
    }

    res.json({
      analysis: suggestions.join(" "),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "PDF analysis failed" });
  }
});

app.get("/", (req, res) => {
  res.send("Server Running ✅");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
