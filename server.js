///----------CHAT GPT HELPED SET THIS UP-----------///
require('dotenv').config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

//Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Atlas connected"))
.catch(err => console.log(err));

//Define schema + model
const testCaseSchema = new mongoose.Schema({
  title: String,
  description: String,
  steps: String,
  expectedResult: String,
  createdAt: { type: Date, default: Date.now }
});

const TestCase = mongoose.model("TestCase", testCaseSchema);

//Route to create a test case
app.post("/api/testcases", async (req, res) => {
  try {
    const { title, description, steps, expectedResult } = req.body;
    const newCase = new TestCase({ title, description, steps, expectedResult });
    await newCase.save();
    res.json({ success: true, message: "Test case saved!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

//Route to get all test cases
app.get("/api/testcases", async (req, res) => {
  const cases = await TestCase.find().sort({ createdAt: -1 });
  res.json(cases);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "create-testcase.html"));
});

//Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
