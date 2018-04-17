const { SALT_LENGTH } = require('./config.js');

const bcrypt = require('bcrypt');

function createHash (string) {
  return bcrypt.hashSync(string, SALT_LENGTH);
}

function compareHash (string, hash) {
  return bcrypt.compareSync(string, hash);
}

function handleUnauthorized () {
  return (err, req, res, next) => {
    res
      .status(401)
      .json({ success: false, error: 'unauthorized' });
  };
}

function authenticationMiddleware ()  {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      handleUnauthorized()(req, res, next);
    }
  };
}

function dataNormalizationMiddleware () {
  return (req, res, next) => {
    req.body.username = req.body.username
      ? req.body.username.toLowerCase()
      : undefined;
    req.body.email = req.body.email
      ? req.body.email.toLowerCase()
      : undefined;

    next();
  };
}

module.exports = {
  createHash, compareHash,
  handleUnauthorized, authenticationMiddleware, dataNormalizationMiddleware };