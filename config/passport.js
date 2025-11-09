// config/passport.js
const LocalStrategy = require('passport-local').Strategy;
const User = require('../app/models/user');

module.exports = function(passport) {

  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
  });

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  passport.use('local-signup', new LocalStrategy({
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done) {
    // asynchronous
    process.nextTick(function() {

      User.findOne({ 'local.email' :  email }, function(err, user) {
        if (err) return done(err);

        // check if user already exists
        if (user) {
          return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
        } else {
          // create the user
          const newUser = new User();
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);

          newUser.save(function(err) {
            if (err) throw err;
            console.log(`Created user: ${email}`);
            return done(null, newUser);
          });
        }
      });    

    });
  }));

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  passport.use('local-login', new LocalStrategy({
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true
  },
  function(req, email, password, done) {
    User.findOne({ 'local.email' :  email }, function(err, user) {
      if (err) return done(err);
      if (!user) return done(null, false, req.flash('loginMessage', 'No user found.'));
      if (!user.validPassword(password))
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
      return done(null, user);
    });
  }));

};
