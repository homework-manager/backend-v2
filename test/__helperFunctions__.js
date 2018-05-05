const fetch = require('node-fetch');

module.exports = {
  logIn: userData =>
    fetch(serverAddress + '/api/v1/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })
      .then(res => res.json()),

  createAccount: userData =>
    fetch(serverAddress + '/api/v1/account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })
      .then(res => res.json())
};