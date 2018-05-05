module.exports = app => {
  const User = require('../schemas/User');
  const {
    handleUnauthorized,
    dataNormalizationMiddleware,
    authenticationMiddleware } = require('../../utils');

  const passport = require('passport');

  app.get(
    '/api/v1/session',
    authenticationMiddleware(),
    (req, res) => {
      res
        .status(200)
        .json({ success: true });
    },
    handleUnauthorized()
  )

  app.post(
    '/api/v1/session',
    dataNormalizationMiddleware(),
    passport.authenticate('local', { failWithError: true }),
    (req, res) => {
      res
        .status(200)
        .json({ success: true });
    },
    handleUnauthorized()
  );

  app.delete(
    '/api/v1/session',
    authenticationMiddleware(),
    (req, res) => {
      res.logout();

      res
        .status(200)
        .json({ success: true });
    }
  )
};