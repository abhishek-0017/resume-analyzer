import express from "express";
import cors from "cors";
import multer from "multer";
import pdfParse from "pdf-parse";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ---------- AI ANALYSIS ---------- */
async function analyzeResumeAI(text) {
  const prompt = `
Analyze this resume and give:

1. ATS Score out of 100
2. Strengths
3. Weaknesses
4. Improvements

Resume:
${text}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content;
}

/* ---------- JOB MATCHING ---------- */
function matchJobs(text) {
  const lower = text.toLowerCase();
  let jobs = [];

  if (lower.includes("react")) jobs.push({ role: "Frontend Developer", match: 85 });
  if (lower.includes("node")) jobs.push({ role: "Backend Developer", match: 80 });
  if (lower.includes("python")) jobs.push({ role: "Data Analyst", match: 75 });

  if (jobs.length === 0) {
    jobs.push({ role: "Software Engineer", match: 60 });
  }

  return jobs;
}

/* ---------- PDF ---------- */
app.post("/upload", upload.any(), async (req, res) => {
  try {
    const file = req.files[0];
    const data = await pdfParse(file.buffer);
    const text = data.text;

    const aiResult = await analyzeResumeAI(text);
    const jobs = matchJobs(text);

    res.json({ analysis: aiResult, jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "PDF error" });
  }
});

/* ---------- TEXT ---------- */
app.post("/analyze-text", async (req, res) => {
  try {
    const { text } = req.body;

    const aiResult = await analyzeResumeAI(text);
    const jobs = matchJobs(text);

    res.json({ analysis: aiResult, jobs });
  } catch (err) {
    res.status(500).json({ error: "Text error" });
  }
});

/* ---------- REWRITE ---------- */
app.post("/rewrite", async (req, res) => {
  try {
    const { text } = req.body;

    const prompt = `Improve this resume:\n${text}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ analysis: response.choices[0].message.content });
  } catch {
    res.status(500).json({ error: "Rewrite error" });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 Server running");
});
