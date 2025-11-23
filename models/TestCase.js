//testcase schema
const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema({
  title: String,
  description: String,
  steps: String,
  expectedResult: String,
  status: {
    type: String,
    enum: ["not-started", "in-progress", "passed", "failed"],
    default: "not-started"
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("TestCase", testCaseSchema);
