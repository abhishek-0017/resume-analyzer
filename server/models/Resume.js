const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  fileName: String,
  analysis: Object,
  score: Number,
  skills: [String],
  missingSkills: [String],
  suggestions: [String]
}, { timestamps: true });

module.exports = mongoose.model("Resume", resumeSchema);
