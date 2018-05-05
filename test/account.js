const assert = require('assert');
const mongoose = require('mongoose');

const {
  fetch,
  createAccount } = require('./__helperFunctions__');

describe('account', function () {

  it('should fail at creating account (no json)', () =>
    fetch('/api/v1/account', { method: 'POST' })
      .then(res => res.json())
      .then(json => {
        assert.equal(typeof json, 'object');
        assert.strictEqual(json.success, false);
        assert.strictEqual(/IsRequired/.test(json.error), true);
      })
  );

  it('should fail at creating account (empty json)', () =>
    fetch('/api/v1/account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })
      .then(res => res.json())
      .then(json => {
        assert.equal(typeof json, 'object');
        assert.strictEqual(json.success, false);
        assert.strictEqual(/IsRequired/.test(json.error), true);
      })
  );

  it('should fail at creating account (invalid username)', () =>
    createAccount({ username: '(invalid username)' })
      .then(json => {
        assert.equal(typeof json, 'object');
        assert.strictEqual(json.success, false);
        assert.strictEqual(json.error, 'usernameIsInvalid');
      })
  );

  it('should fail at creating account (invalid password)', () =>
    createAccount({ password: 'shrt' })
      .then(json => {
        assert.equal(typeof json, 'object');
        assert.strictEqual(json.success, false);
        assert.strictEqual(json.error, 'passwordIsInvalid');
      })
  );

  it('should fail at creating account (invalid email)', () =>
    createAccount({ email: 'not valid email' })
      .then(json => {
        assert.equal(typeof json, 'object');
        assert.strictEqual(json.success, false);
        assert.strictEqual(json.error, 'emailIsInvalid');
      })
  );

  it('should fail at creating account (invalid full name)', () =>
    createAccount({
      fullname: Array(50).fill('bullshit').join('')
    })
      .then(json => {
        assert.equal(typeof json, 'object');
        assert.strictEqual(json.success, false);
        assert.strictEqual(json.error, 'fullnameIsInvalid');
      })
  );

  it('should create a account', () =>
    createAccount()
      .then(json => {
        assert.equal(typeof json, 'object');
        assert.strictEqual(json.success, true);
      })
  );

});
