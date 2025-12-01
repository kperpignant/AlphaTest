//testcase schema
const mongoose = require("mongoose");
const cloudinary = require("../middleware/cloudinary")

const testCaseSchema = new mongoose.Schema({
  title: String,
  description: String,
  steps: String,
  expectedResult: String,
  estimate: String,
  type: {
    type: String,
    enum: ["functional", "regression", "smoke", "sanity", "exploratory", "unit test", "other"],
    default: "functional"
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium"
  },
  preconditions: String,
  labels: {
    type: [String],
    default:[]
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
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
