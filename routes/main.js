const express = require("express");
const router = express.Router();
const passport = require("passport");
const TestCase = require("../models/TestCase");

//make sure the user is logged in to do stuff
// Protect middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// Default route > login page
router.get("/", (req, res) => {
  res.render("login", { message: req.flash("loginMessage") });
});

// Login page
router.get("/login", (req, res) => {
  res.render("login", { message: req.flash("loginMessage") });
});

// Signup page
router.get("/signup", (req, res) => {
  res.render("signup", { message: req.flash("signupMessage") });
});

// POST login
router.post("/login",passport.authenticate("local-login", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true
  })
);

// POST signup
router.post("/signup",passport.authenticate("local-signup", {
    successRedirect: "/dashboard",
    failureRedirect: "/signup",
    failureFlash: true
  })
);

// Dashboard
router.get("/dashboard", isLoggedIn, (req, res) => {
  res.render("dashboard", { user: req.user });
});

// Test Case Page
router.get("/testcase", isLoggedIn, (req, res) => {
  res.render("testcase", { user: req.user });
});

//create a testcase
router.get("/create-testcase", isLoggedIn, (req, res) => {
  res.render("create-testcase", { user: req.user });
});

//pull testcases api and render and sort them
router.get("/testcases", isLoggedIn, async (req, res) => {//added isLoggedIn for security reasons
  const sort = req.query.sort || "createdAt";

  const testcases = await TestCase.find().sort({
    status: sort === "status" ? 1 : undefined,
    createdAt: sort === "createdAt" ? -1 : undefined
  });

  res.render("testcases", { 
    cases: testcases,
    user: req.user
  });
});

// Single test case detail page
router.get("/testcases/:id", isLoggedIn, async (req, res) => {
  try {
    const test = await TestCase.findById(req.params.id);

    if (!test) return res.status(404).send("Test case not found");

    res.render("testcase-details", {
      user: req.user,
      test
    });
  } catch (err) {
    console.error("Error loading testcase:", err);
    res.status(500).send("Could not load test case");
  }
});

//Edit test cases
router.get("/testcases/:id/edit", async (req, res) => {
  const test = await TestCase.findById(req.params.id);
  res.render("edit-testcase", { test });
});

router.post("/testcases/:id/edit", async (req, res) => {
  const { title, description, steps, expectedResult, status } = req.body;

  await TestCase.findByIdAndUpdate(req.params.id, {
    title,
    description,
    steps,
    expectedResult,
    status
  });

  res.redirect(`/testcases/${req.params.id}`);
});

// DELETE a test case
router.post("/testcases/:id/delete", async (req, res) => {
  try {
    await TestCase.findByIdAndDelete(req.params.id);
    res.redirect("/testcases");
  } catch (err) {
    console.error("Error deleting test case:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => res.redirect("/login"));
});

module.exports = router;
