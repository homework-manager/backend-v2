module.exports = app => {
  const User = require('../schemas/User');
  const {
    authenticationMiddleware,
    dataNormalizationMiddleware } = require('../../utils');
  const { regexps } = require('../../config.js');

  const passport = require('passport');

  function validRequestMiddleware () {
    return (req, res, next) => {
      if (req.body.username &&
          req.body.password &&
          req.body.fullname &&
          req.body.email) next();
      else res
        .status(400)
        .json({ success: false, error: 'invalidRequest' });
    }
  }

  function userRequirementMiddleware () {
    return async (req, res, next) => {
      const { username, fullname, password, email } = req.body;

      const valid = {
        username: regexps.username.test(username),
        fullname: regexps.fullname.test(fullname),
        password: regexps.password.test(password),
        email: regexps.email.test(email)
      };

      // What you are about to see is a HORRIBLE piece of code
      // Just... it works, don't touch it, ok?
      const isSomethingInvalid = Object.keys(valid).map(key => {
        const isValid = valid[key];
        // if there's any unvalid field
        if (!isValid) {
          res
            .status(400)
            .json({ success: false, error: `${key}IsntValid` });
        }

        return !isValid;
      }).some(bool => bool);

      if (!isSomethingInvalid) next();
    };
  }

  function alreadyExistsMiddleware () {
    return async (req, res, next) => {
      const { username, email } = req.body;

      if (await User.findOne({ username })) {
        res
          .status(409)
          .json({ success: false, error: 'usernameAlreadyUsed' });
      } else if (await User.findOne({ email })) {
        res
          .status(409)
          .json({ success: false, error: 'emailAlreadyUsed' });
      } else {
        next();
      }
    };
  }

  app.get(
    '/api/v1/account',
    authenticationMiddleware(),
    (req, res) => {
      res
        .status(200)
        .json({ success: true, user: req.user.getPrivateData() });
    }
  );

  app.post(
    '/api/v1/account',
    validRequestMiddleware(),
    dataNormalizationMiddleware(),
    userRequirementMiddleware(),
    alreadyExistsMiddleware(),
    async (req, res) => {
      const newUser = new User(req.body);
    
      newUser.setPassword(req.body.password);
    
      await newUser.save();
    
      res
        .status(200)
        .json({ success: true });
    }
  );

  app.patch(
    '/api/v1/account',
    authenticationMiddleware(),
    validRequestMiddleware(),
    dataNormalizationMiddleware(),
    userRequirementMiddleware(),
    alreadyExistsMiddleware(),
    async (req, res) => {
      await User.update({ _id: req.user._id }, req.body);

      res
        .status(200)
        .json({ success: true });
    }
  );

};