//pull the data from the database/mongodb

const express = require("express");
const router = express.Router();
const TestCase = require("../models/TestCase");

// Create a test case
router.post("/testcases", async (req, res) => {
  try {
    const { title, description, steps, expectedResult } = req.body;
    const newCase = new TestCase({ title, description, steps, expectedResult });
    await newCase.save();
    res.json({ success: true, message: "Test case saved!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all test cases
router.get("/testcases", async (req, res) => {
  const cases = await TestCase.find().sort({ createdAt: -1 });
  res.json(cases);
});

module.exports = router;
