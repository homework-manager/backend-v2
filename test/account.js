const assert = require('assert');
const mongoose = require('mongoose');

const {
  fetch,
  createAccount,
  getMockData } = require('./__helperFunctions__');

describe('account', function () {
  beforeEach('clear database', () => mongoose.connection.dropDatabase());

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
    createAccount({})
      .then(json => {
        assert.equal(typeof json, 'object');
        assert.strictEqual(json.success, false);
        assert.strictEqual(/IsRequired/.test(json.error), true);
      })
  );

  it('should fail at creating account (invalid username)', () =>
    createAccount({
      username: '(invalid username)',
      password: 'actuallyvalidpassword',
      email: 'test@e.mail'
    })
      .then(json => {
        assert.equal(typeof json, 'object');
        assert.strictEqual(json.success, false);
        assert.strictEqual(json.error, 'usernameIsInvalid');
      })
  );

  it('should fail at creating account (invalid password)', () =>
    createAccount({
      username: 'validUsername',
      password: 'shrt',
      email: 'test@e.mail'
    })
      .then(json => {
        assert.equal(typeof json, 'object');
        assert.strictEqual(json.success, false);
        assert.strictEqual(json.error, 'passwordIsInvalid');
      })
  );

  it('should fail at creating account (invalid email)', () =>
    createAccount({
      username: 'validUsername',
      password: 'actuallyvalidpassword',
      email: 'not valid email'
    })
      .then(json => {
        assert.equal(typeof json, 'object');
        assert.strictEqual(json.success, false);
        assert.strictEqual(json.error, 'emailIsInvalid');
      })
  );

  it('should fail at creating account (invalid full name)', () =>
    createAccount({
      username: 'validUsername',
      password: 'actuallyvalidpassword',
      email: 'test@e.mail',
      fullname: Array(50).fill('bullshit').join('')
    })
      .then(json => {
        assert.equal(typeof json, 'object');
        assert.strictEqual(json.success, false);
        assert.strictEqual(json.error, 'fullnameIsInvalid');
      })
  );

  it('should create a account', () =>
    createAccount(getMockData())
      .then(json => {
        assert.equal(typeof json, 'object');
        assert.strictEqual(json.success, true);
      })
  );
});
