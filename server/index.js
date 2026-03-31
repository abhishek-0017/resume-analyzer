require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection (FINAL FIX)
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected ✅");
})
.catch((err) => {
    console.error("MongoDB Error ❌:", err.message);
    process.exit(1); // stop app if DB fails
});

// ✅ Routes (keep your existing routes here if any)
app.get("/", (req, res) => {
    res.send("API running");
});

// ✅ PORT (important for Render)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
