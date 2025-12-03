
const express = require("express");
const router = express.Router();
const passport = require("passport");
const TestCase = require("../models/TestCase");
const upload = require("../middleware/multer");
const testcaseController = require("../controllers/testcaseController");
const User = require("../models/User");

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
// router.get("/create-testcase", isLoggedIn, async (req, res) => {
//   try {
//     const users = await User.find();  // <-- NEW
//     res.render("create-testcase", {
//       user: req.user,
//       users   // <-- pass users to the view
//     });
//   } catch (err) {
//     console.log(err);
//     res.send("Error loading create testcase page");
//   }
// });

router.get("/create-testcase", isLoggedIn, async (req, res) => {
  const users = await User.find({}, "local.username _id"); // Fetch all users

  console.log("Users returned to EJS:", users);   // <--- IMPORTANT

  res.render("create-testcase", {
    user: req.user,
    users // send to EJS
  });
});




router.post("/testcases/create", async (req, res) => {
  try {
    const labels = req.body.labels
      ? req.body.labels.split(",").map(t => t.trim())
      : [];

    await TestCase.create({
      title: req.body.title,
      description: req.body.description,
      steps: req.body.steps,
      expectedResult: req.body.expectedResult,
      estimate: req.body.estimate,
      type: req.body.type,
      priority: req.body.priority,
      preconditions: req.body.preconditions,
      labels,
      assignedTo: req.body.assignedTo || null
    });

    res.redirect("/testcases");
  } catch (err) {
    console.log(err);
    res.send("Error creating test case");
  }
});


//pull testcases api and render and sort them

// router.get("/testcases", isLoggedIn, async (req, res) => {//added isLoggedIn for security reasons
//   const sort = req.query.sort || "createdAt";

//   const testcases = await TestCase.find().sort({
//     status: sort === "status" ? 1 : undefined,
//     createdAt: sort === "createdAt" ? -1 : undefined
//   });

//   res.render("testcases", { 
//     cases: testcases,
//     user: req.user
//   });
// });

router.get("/testcases", isLoggedIn, async (req,res) => {//get route to testcases and require user to be logged in
  const sort = req.query.sort || "createdAt"; //sorting by createdAt time. Checks if the url is trying to sort by createdAt
  let testcases;
  if(sort === "status") {
    testcases = await TestCase.aggregate([//aggregate() instead of sort()
      {
       $addFields: {//create a new, temporary field called statusOrder and work with that
        statusOrder: {//because mongoDB only sorts alphabetically, assign existing fields a numeric value and sort by that
          $switch: {
            branches: [
              {case: {$eq: ["$status", "not-started"]}, then: 1},//'if case is true, assign this number' then return that number
              {case: {$eq: ["$status", "in-progress"]}, then: 2},
              {case: {$eq: ["$status", "passed"]}, then: 3},
              {case: {$eq: ["$status", "failed"]}, then: 4}
            ],
            default: 5 //if all the above fail, assign 5, wildcard value- move it to the bottom of the list/last for errors/typos/null/etc
          }
        }
       } 
      },
      {$sort: {statusOrder: 1, createdAt: -1}}//then, sort by these two criteria instead
    ]);//sort by the numerical status order and createdAt = -1 being newest first within each status group
  } else {
    testcases = await TestCase.find().sort({createdAt: -1}); //if not sorting by status, sort by most recent
  }
  res.render("testcases", {
    cases: testcases,
    user:req.user
  });
});



router.post("/testcases/:id/upload", upload.single("attachment"), testcaseController.uploadFile);

//Edit test cases - moved up to avoid 404
router.post("/testcases/:id/edit", async (req, res) => {
  try {
    let labels = req.body.labels
      ? req.body.labels.split(",").map(l => l.trim())
      : [];

    await TestCase.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      description: req.body.description,
      steps: req.body.steps,
      expectedResult: req.body.expectedResult,
      estimate: req.body.estimate,
      type: req.body.type,
      priority: req.body.priority,
      preconditions: req.body.preconditions,
      labels,
      assignedTo: req.body.assignedTo || null,
      status: req.body.status
    });

    res.redirect(`/testcases/${req.params.id}`);
  } catch (err) {
    console.log(err);
    res.send("Error saving test case changes");
  }
});

router.get("/testcases/:id/edit", isLoggedIn, async (req, res) => {
  try {
    //const test = await TestCase.findById(req.params.id);
    const test = await TestCase.findById(req.params.id).populate("assignedTo");//hopefully fixes the issue where users aren't populating
    //const users = await User.find();
    //const users = await User.find({}, "local.username _id");
    const users = await User.find();

    if (!test) return res.status(404).send("Test case not found");

    //res.render("edit-testcase", { test, users });
    res.render("edit-testcase", {
      test,
      users,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Could not load edit page");
  }
});


// Single test case detail page
router.get("/testcases/:id", isLoggedIn, async (req, res) => {
  try {
    const test = await TestCase.findById(req.params.id).populate("assignedTo");

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
