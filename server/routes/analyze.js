const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const Analysis = require("../models/Analysis");

const upload = multer({ dest: "uploads/" });

const skillsList = [
  "javascript",
  "react",
  "node",
  "python",
  "java",
  "mongodb",
  "express",
  "sql",
  "c++",
  "git",
  "github",
  "html",
  "css"
];

router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    const text = pdfData.text.toLowerCase();

    const matched = skillsList.filter(skill =>
      text.includes(skill)
    );

    const missing = skillsList.filter(
      skill => !matched.includes(skill)
    );

    const score = Math.round(
      (matched.length / skillsList.length) * 100
    );

    // ✅ SAVE TO DATABASE
    const newAnalysis = new Analysis({
      userEmail: req.body.email,
      score,
      matched,
      missing
    });

    await newAnalysis.save();

    // delete file
    fs.unlinkSync(filePath);

    res.json({
      score,
      matched,
      missing,
      feedback: {
        summary: "Resume analyzed successfully",
        strengths: ["Good technical skills"],
        weaknesses: missing.length ? ["Missing important skills"] : [],
        suggestions: [
          "Add measurable achievements",
          "Use action verbs",
          "Improve formatting"
        ]
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Analysis failed" });
  }
});

module.exports = router;