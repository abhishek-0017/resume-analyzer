const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema({
  userEmail: String,
  score: Number,
  matched: [String],
  missing: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Analysis", analysisSchema);