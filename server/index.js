const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/analyze", require("./routes/analyze"));
app.use("/api/history", require("./routes/history")); // ✅ NEW

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.listen(5000, () => console.log("Server running on port 5000"));