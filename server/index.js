import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ENV VARIABLES
const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 🔥 CONNECT TO MONGODB
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error ❌:", err));

// 🔥 OPENAI SETUP
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// 🔥 TEST ROUTE
app.get("/", (req, res) => {
  res.send("API running 🚀");
});

// 🔥 AI RESUME ANALYZER ROUTE
app.post("/analyze", async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "Resume text is required" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional resume reviewer.",
        },
        {
          role: "user",
          content: `Analyze this resume and give improvement suggestions:\n\n${resumeText}`,
        },
      ],
    });

    res.json({
      success: true,
      result: response.choices[0].message.content,
    });

  } catch (error) {
    console.error("AI Error ❌:", error);
    res.status(500).json({
      success: false,
      error: "Something went wrong with AI",
    });
  }
});

// 🔥 PORT FIX FOR RENDER
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
