const assert = require('assert');
const mongoose = require('mongoose');

const User = require('../config/schemas/User');
const {
  fetch,
  logIn,
  createAccountViaSchema,
  getRandomToken } = require('./__helperFunctions__');

describe('session', function () {
  beforeEach('clear database', () => mongoose.connection.dropDatabase());

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
    const user = await createAccountViaSchema();

    return await logIn({
      username: user.username,
      password: user.password
    })
      .then(json => {
        assert.equal(typeof json, 'object');
        assert.strictEqual(json.success, true);
        assert.strictEqual(/^Bearer /.test(json.token), true);
      });
  });

  it('should fail at getting session (check if token valid)', () =>
    fetch('/api/v1/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'not a token'
      }
    })
      .then(res => res.json())
      .then(json => {
        assert.equal(typeof json, 'object');
        assert.strictEqual(json.success, false);
        assert.strictEqual(json.error, 'unauthorized');
      })
  );

  it('should get session (check if token valid)', async () => {
    return await fetch('/api/v1/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await getRandomToken()
      }
    })
      .then(res => res.json())
      .then(json => {
        assert.equal(typeof json, 'object');
        assert.strictEqual(json.success, true);
      });
  });
});
