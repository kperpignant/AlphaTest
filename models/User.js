
//user Schema
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
    local: {
        username: { type: String, unique: true },
        email:    { type: String, unique: true },
        password: String
    }
});

// Generate hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

// Validate password
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model("User", userSchema);
