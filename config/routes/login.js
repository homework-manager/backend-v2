module.exports = app => {
  const User = require('../schemas/User');
  const {
    handleUnauthorized,
    dataNormalizationMiddleware } = require('../../utils');

  const passport = require('passport');

  app.post(
    '/api/v1/login',
    dataNormalizationMiddleware(),
    passport.authenticate('local', { failWithError: true }),
    (req, res, next) => {
      res
        .status(200)
        .json({ success: true });
    },
    handleUnauthorized()
  );
};