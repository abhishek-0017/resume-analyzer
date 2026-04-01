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

/* =========================
   🔥 ATS ANALYSIS FUNCTION
========================= */
function analyzeResume(text) {
  text = text.toLowerCase();

  let score = 0;
  let suggestions = [];
  let found = [];

  // ✅ Skills
  if (text.includes("java") || text.includes("python") || text.includes("sql")) {
    score += 20;
    found.push("Skills");
  } else {
    suggestions.push("Add technical skills like Java, Python, SQL.");
  }

  // ✅ Projects
  if (text.includes("project")) {
    score += 25;
    found.push("Projects");
  } else {
    suggestions.push("Add 2-3 strong projects with proper description.");
  }

  // ✅ Experience
  if (text.includes("experience") || text.includes("internship")) {
    score += 25;
    found.push("Experience");
  } else {
    suggestions.push("Add internships or work experience.");
  }

  // ✅ Education
  if (text.includes("mca") || text.includes("btech")) {
    score += 15;
    found.push("Education");
  } else {
    suggestions.push("Clearly mention your education.");
  }

  // ✅ Achievements
  if (
    text.includes("%") ||
    text.includes("improved") ||
    text.includes("increased")
  ) {
    score += 15;
    found.push("Achievements");
  } else {
    suggestions.push(
      "Add measurable achievements (e.g., increased performance by 30%)."
    );
  }

  return {
    score,
    found,
    suggestions,
  };
}

/* =========================
   🔹 TEXT ANALYSIS ROUTE
========================= */
app.post("/analyze-text", (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const result = analyzeResume(text);

    res.json({
      analysis: `
ATS Score: ${result.score}/100

Sections Found: ${result.found.join(", ") || "None"}

Suggestions:
- ${result.suggestions.join("\n- ")}
      `,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Text analysis failed" });
  }
});

/* =========================
   🔹 PDF ANALYSIS ROUTE
========================= */
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    console.log("📂 Upload request received");

    const pdfBuffer = req.file.buffer;
    const data = await pdfParse(pdfBuffer);

    console.log("📄 PDF parsed successfully");

    const result = analyzeResume(data.text);

    res.json({
      analysis: `
ATS Score: ${result.score}/100

Sections Found: ${result.found.join(", ") || "None"}

Suggestions:
- ${result.suggestions.join("\n- ")}
      `,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "PDF analysis failed" });
  }
});

/* =========================
   🔹 ROOT
========================= */
app.get("/", (req, res) => {
  res.send("Server Running ✅");
});

/* =========================
   🔹 START SERVER
========================= */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
