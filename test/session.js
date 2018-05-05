const assert = require('assert');
const mongoose = require('mongoose');

const User = require('../config/schemas/User');
const {
  fetch,
  logIn,
  createAccountViaSchema,
  getRandomToken } = require('./__helperFunctions__');

describe('session', function () {

  it('should fail at trying to log in (no json)', async () =>
    fetch('/api/v1/session', { method: 'POST' })
      .then(res => res.json())
      .then(json => {
        assert.strictEqual(typeof json, 'object');
        assert.strictEqual(json.success, false);
        assert.strictEqual(/IsRequired/.test(json.error), true);
      })
  );

  it('should fail at trying to log in (empty json)', async () =>
    fetch('/api/v1/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
      .then(res => res.json())
      .then(json => {
        assert.strictEqual(typeof json, 'object');
        assert.strictEqual(json.success, false);
        assert.strictEqual(/IsRequired/.test(json.error), true);
      })
  );

  it('should fail at trying to log in (wrong username)', async () => {
    const user = await createAccountViaSchema();

    return await logIn({
      username: 'not the username',
      password: user.password
    })
      .then(json => {
        assert.strictEqual(typeof json, 'object');
        assert.strictEqual(json.success, false);
        assert.strictEqual(json.error, 'unauthorized');
      });
  });

  it('should fail at trying to log in (wrong password)', async () => {
    const user = await createAccountViaSchema();

    return await logIn({
      username: user.username,
      password: 'not the password'
    })
      .then(json => {
        assert.strictEqual(typeof json, 'object');
        assert.strictEqual(json.success, false);
        assert.strictEqual(json.error, 'unauthorized');
      });
  });

  it('should fail at trying to log in (account doesn\'t exist)', () =>
    logIn({
      username: 'skrrt',
      password: 'eskere'
    })
      .then(json => {
        assert.strictEqual(typeof json, 'object');
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
        assert.strictEqual(typeof json, 'object');
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
        assert.strictEqual(typeof json, 'object');
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
        assert.strictEqual(typeof json, 'object');
        assert.strictEqual(json.success, true);
      });
  });

});
