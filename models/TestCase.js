//testcase schema
const mongoose = require("mongoose");
const cloudinary = require("../middleware/cloudinary")

const testCaseSchema = new mongoose.Schema({
  title: String,
  description: String,
  steps: String,
  expectedResult: String,
  attachments: [
    {
      url: String,
      public_id: String
    }
  ],
  status: {
    type: String,
    enum: ["not-started", "in-progress", "passed", "failed"],
    default: "not-started"
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("TestCase", testCaseSchema);
