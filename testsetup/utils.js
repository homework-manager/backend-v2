const fetch = global.__FETCH_FUNC__;
const { createHash } = require('../utils');
const User = require('../config/schemas/User');

module.exports.insertTestUser = userData => {
  let newUser = new User(userData);
  newUser.setPassword(userData.password);
  return newUser.save();
};

module.exports.logIn = userData =>
  fetch('/api/v1/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });