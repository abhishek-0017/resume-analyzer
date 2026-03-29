const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name,
      email,
      password,
    });

    await newUser.save();

    res.json({ message: "Signup successful" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error in signup" });
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt:", email, password);

    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found");
      return res.status(400).json({ message: "User not found" });
    }

    console.log("User found:", user.email, user.password);

    // ✅ SIMPLE PASSWORD CHECK (NO BCRYPT)
    if (user.password !== password) {
      console.log("Wrong password");
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      message: "Login successful",
      user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error in login" });
  }
});

module.exports = router;
