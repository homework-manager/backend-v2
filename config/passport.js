module.exports = async () => new Promise((resolve, reject) => {
  const User = require('./schemas/User');
  const { compareHash } = require('../utils.js');

  const passport = require('passport');
  const LocalStrategy = require('passport-local').Strategy;

  passport.use(new LocalStrategy(
    async (username, password, done) => {
      const user = await User.findOne({ username });
  
      if (!user) {
        return done(null, false);
      }
  
      if (compareHash(password, user.passwordHash)) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    }
  ));

  passport.serializeUser((user, cb) => {
    cb(null, user._id);
  });

  passport.deserializeUser(async (id, cb) => {
    try {
      cb(null, await User.findOne({ _id: id }));
    } catch (error) {
      cb(error);
    }
  });

  resolve();
});
