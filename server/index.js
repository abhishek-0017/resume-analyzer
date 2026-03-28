console.log("🔥 SERVER STARTED");

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const pdfParse = require("pdf-parse");

const Resume = require("./models/Resume");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/resumeDB")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// ✅ Upload folder
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// ✅ Root API
app.get("/", (req, res) => {
  res.send("API RUNNING 🚀");
});

// 🚀 UPLOAD API
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const buffer = fs.readFileSync(filePath);

    const data = await pdfParse(buffer);
    const text = data.text.toLowerCase();

    fs.unlinkSync(filePath);

    // ✅ Skill list
    const skillsList = [
      "javascript","react","node","python","java",
      "html","css","mongodb","express","sql","c++","git","github"
    ];

    const matched = skillsList.filter(skill => text.includes(skill));
    const missing = skillsList.filter(skill => !matched.includes(skill));

    const score = Math.round((matched.length / skillsList.length) * 100);

    // ✅ Suggestions
    let suggestions = [];

    if (missing.length > 0) suggestions.push("Add missing skills");
    if (matched.length < 5) suggestions.push("Add more skills");
    if (!text.includes("project")) suggestions.push("Add projects");
    if (!text.includes("experience")) suggestions.push("Add experience");

    // 🤖 FREE AI ANALYSIS
    let aiAnalysis = "";

    // 📄 Summary
    aiAnalysis += "📄 Summary:\n";
    if (text.length > 1000) {
      aiAnalysis += "- Your resume has good content length.\n";
    } else {
      aiAnalysis += "- Your resume is short, add more details.\n";
    }

    // 💪 Strengths
    aiAnalysis += "\n💪 Strengths:\n";
    if (matched.length > 7) {
      aiAnalysis += "- Strong technical skill set.\n";
    }
    if (text.includes("project")) {
      aiAnalysis += "- Projects section present.\n";
    }
    if (text.includes("experience")) {
      aiAnalysis += "- Experience section present.\n";
    }

    // ⚠️ Weaknesses
    aiAnalysis += "\n⚠️ Weaknesses:\n";
    if (missing.length > 0) {
      aiAnalysis += "- Missing skills: " + missing.join(", ") + "\n";
    }
    if (!text.includes("project")) {
      aiAnalysis += "- No projects mentioned.\n";
    }
    if (!text.includes("experience")) {
      aiAnalysis += "- No experience mentioned.\n";
    }

    // 💡 Suggestions
    aiAnalysis += "\n💡 Suggestions:\n";
    aiAnalysis += "- Add measurable achievements.\n";
    aiAnalysis += "- Use action verbs (Developed, Built, Designed).\n";
    aiAnalysis += "- Improve formatting and readability.\n";

    // ✅ Save to DB
    const saved = await Resume.create({
      fileName: req.file.originalname,
      score,
      skills: matched,
      missingSkills: missing,
      suggestions
    });

    // ✅ Response
    res.json({
      atsScore: score,
      matchedKeywords: matched,
      missingKeywords: missing,
      suggestions,
      aiAnalysis,
      id: saved._id
    });

  } catch (err) {
    console.log("❌ ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 📄 DOWNLOAD PDF
app.get("/download/:id", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

    doc.pipe(res);

    doc.fontSize(18).text("Resume Report");
    doc.moveDown();

    doc.text(`Score: ${resume.score}`);
    doc.moveDown();

    doc.text("Matched Skills:");
    (resume.skills || []).forEach(s => doc.text("✔ " + s));

    doc.moveDown();

    doc.text("Missing Skills:");
    (resume.missingSkills || []).forEach(s => doc.text("❌ " + s));

    doc.moveDown();

    doc.text("Suggestions:");
    (resume.suggestions || []).forEach(s => doc.text("💡 " + s));

    doc.end();

  } catch (err) {
    res.status(500).send("Error generating PDF");
  }
});

// ✅ START SERVER
app.listen(5000, () => {
  console.log("🚀 Running on http://localhost:5000");
});
