const fetch = require('node-fetch');
const assert = require('assert');

const User = require('../config/schemas/User');
const { logIn } = require('./__helperFunctions__');

it('should fail at trying to log in (account doesn\'t exist)', () =>
  logIn({
    username: 'skrrt',
    password: 'eskere'
  })
    .then(json => {
      assert.equal(typeof json, 'object');
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.error, 'unauthorized');
    })
);

it('should log in', async () => {
  const [username, password, email] = [
    'test',
    'testpassword',
    'test@e.mail'
  ];

  const user = new User({ username, email });
  user.setPassword(password);
  await user.save();

  return await logIn({ username, password })
    .then(json => {
      assert.equal(typeof json, 'object');
      assert.strictEqual(json.success, true);
    })
});