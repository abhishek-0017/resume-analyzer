const express = require("express");
const router = express.Router();
const Analysis = require("../models/Analysis");

router.get("/:email", async (req, res) => {
  try {
    const data = await Analysis.find({
      userEmail: req.params.email
    }).sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching history" });
  }
});

module.exports = router;