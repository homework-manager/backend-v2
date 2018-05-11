module.exports = app => {
  const User = require('../schemas/User');
  const { SESSION_SECRET } = require('../../config.js');
  const {
    handleUnauthorized,
    dataNormalizationMiddleware,
    authenticationMiddleware,
    compareHash } = require('../../utils');

  const passport = require('passport');
  const jwt = require('jsonwebtoken');

  app.get(
    '/api/v1/session',
    authenticationMiddleware(),
    (req, res) => {
      res
        .status(200)
        .json({ success: true });
    },
    handleUnauthorized()
  );

  app.post(
    '/api/v1/session',
    dataNormalizationMiddleware(),
    async (req, res) => {
      const { username, password } = req.body;

      if (!username) {
        return res
          .status(400)
          .json({ success: false, error: 'usernameIsRequired' });
      }
      if (!password) {
        return res
          .status(400)
          .json({ success: false, error: 'passwordIsRequired' });
      }

      const user = await User.findOne({ username });

      if (!user) {
        return handleUnauthorized()(null, req, res);
      }

      if (compareHash(password, user.passwordHash)) {
        const token =
          'Bearer ' + jwt.sign({
            id: user._id
          }, SESSION_SECRET, {
            expiresIn: 604800
          });
        
        return res
          .status(200)
          .json({ success: true, token });
      } else {
        return handleUnauthorized()(null, req, res);
      }
    }
  );
};