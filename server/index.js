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

  if (text.includes("java") || text.includes("python") || text.includes("sql")) {
    score += 20;
    found.push("Skills");
  } else {
    suggestions.push("Add technical skills like Java, Python, SQL.");
  }

  if (text.includes("project")) {
    score += 25;
    found.push("Projects");
  } else {
    suggestions.push("Add 2-3 strong projects.");
  }

  if (text.includes("experience") || text.includes("internship")) {
    score += 25;
    found.push("Experience");
  } else {
    suggestions.push("Add internships or experience.");
  }

  if (text.includes("mca") || text.includes("btech")) {
    score += 15;
    found.push("Education");
  } else {
    suggestions.push("Mention education clearly.");
  }

  if (
    text.includes("%") ||
    text.includes("improved") ||
    text.includes("increased")
  ) {
    score += 15;
    found.push("Achievements");
  } else {
    suggestions.push("Add measurable achievements.");
  }

  return { score, found, suggestions };
}

/* =========================
   🔥 JOB MATCH FUNCTION
========================= */
function matchJob(resumeText, jobDesc) {
  const resume = resumeText.toLowerCase();
  const job = jobDesc.toLowerCase();

  const keywords = ["java", "python", "sql", "react", "node", "aws"];

  let matchCount = 0;
  let missing = [];

  keywords.forEach((skill) => {
    if (job.includes(skill)) {
      if (resume.includes(skill)) {
        matchCount++;
      } else {
        missing.push(skill);
      }
    }
  });

  let score = Math.round((matchCount / keywords.length) * 100);

  return { score, missing };
}

/* =========================
   🔹 TEXT ANALYSIS
========================= */
app.post("/analyze-text", (req, res) => {
  try {
    const { text } = req.body;

    const result = analyzeResume(text);

    res.json({
      analysis: `
ATS Score: ${result.score}/100

Sections Found: ${result.found.join(", ") || "None"}

Suggestions:
- ${result.suggestions.join("\n- ")}
      `,
    });
  } catch (err) {
    res.status(500).json({ error: "Text analysis failed" });
  }
});

/* =========================
   🔹 PDF ANALYSIS
========================= */
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    console.log("📂 Upload request received");

    const data = await pdfParse(req.file.buffer);

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "PDF analysis failed" });
  }
});

/* =========================
   🔥 JOB MATCH ROUTE
========================= */
app.post("/match-job", (req, res) => {
  try {
    const { resumeText, jobDesc } = req.body;

    const result = matchJob(resumeText, jobDesc);

    res.json({
      analysis: `
Match Score: ${result.score}%

Missing Skills:
- ${result.missing.join("\n- ") || "None"}
      `,
    });
  } catch (err) {
    res.status(500).json({ error: "Job match failed" });
  }
});

/* ========================= */
app.get("/", (req, res) => {
  res.send("Server Running ✅");
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
