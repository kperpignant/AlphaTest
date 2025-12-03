
const mongoose = require("mongoose");

const testRunSchema = new mongoose.Schema({
  name: String,
  description: String,
  testCases: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "TestCase"
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("TestRun", testRunSchema);
