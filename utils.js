const { SALT_LENGTH } = require('./config.js');

const passport = require('passport');
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

function handleForbidden () {
  return (req, res) => {
    res
      .status(403)
      .json({ success: false, error: 'forbidden' });
  };
}

function authenticationMiddleware ()  {
  // return (req, res, next) => {
  //   if (req.isAuthenticated()) {
  //     next();
  //   } else {
  //     handleUnauthorized()(null, req, res, next);
  //   }
  // };
  return passport.authenticate('jwt', {
    session: false,
    failWithError: true
  });
}

function dataNormalizationMiddleware () {
  return (req, res, next) => {
    req.body.username = req.body.username
      ? req.body.username.toLowerCase()
      : undefined;
    req.body.email = req.body.email
      ? req.body.email.toLowerCase()
      : undefined;
    
    req.body.joinName = req.body.joinName
      ? req.body.joinName.toLowerCase()
      : undefined;

    next();
  };
}

function handleError (error, req, res) {
  const key = Object.keys(error.errors)[0];
  const errorObj = error.errors[key];

  switch (errorObj.kind) {
    case 'unique':
      return res
        .status(409)
        .json({ success: false, error: `${key}AlreadyExists` });
    case 'required':
      return res
        .status(400)
        .json({ success: false, error: `${key}IsRequired` });
    default:
      if (errorObj.properties &&
          errorObj.properties.validator instanceof RegExp) {
            return res
              .status(400)
              .json({ success: false, error: `${key}IsInvalid` });
      } else {
        console.log('SERVER SIDE ERROR!', error)
        
        return res
          .status(500)
          .json({ success: false, error: 'serverSideError' });
      }
  }
}

module.exports = {
  createHash, compareHash, handleError, handleForbidden,
  handleUnauthorized, authenticationMiddleware,
  dataNormalizationMiddleware };