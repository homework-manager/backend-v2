module.exports = async () => new Promise((resolve, reject) => {
  const User = require('./schemas/User');
  const { compareHash } = require('../utils.js');
  const { SESSION_SECRET } = require('../config.js');

  const passport = require('passport');
  const JwtStrategy = require('passport-jwt').Strategy;
  const { ExtractJwt } = require('passport-jwt');

  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SESSION_SECRET
  }, async (jwtPayload, done) => {

    const user = await User.findOne({ _id: jwtPayload.id });
  
    if (user) {
      return done(null, user);
    } else {
      return done(null, false, { success: false, error: 'unauthorized' });
    }

  }));

  resolve();
});
