
//necessary declarations to get things working

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Middleware that is supplementary and helps
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

// Passport
require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/", require("./routes/main"));
app.use("/api", require("./routes/api"));

// Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
