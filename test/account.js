const assert = require('assert');

const {
  fetch, fetchWithToken,
  getMockData,
  editAccount,
  createAccount } = require('./__helperFunctions__');

describe('account', function () {

  // ################
  //  create account
  // ################

  describe('create account', function () {

    it('should fail at creating account (no json)', () =>
      fetch('/api/v1/account', { method: 'POST' })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
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
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(/IsRequired/.test(json.error), true);
        })
    );

    it('should fail at creating account (invalid username)', () =>
      createAccount({ username: '(invalid username)' })
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'usernameIsInvalid');
        })
    );

    it('should fail at creating account (invalid password)', () =>
      createAccount({ password: 'shrt' })
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'passwordIsInvalid');
        })
    );

    it('should fail at creating account (invalid email)', () =>
      createAccount({ email: 'not valid email' })
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'emailIsInvalid');
        })
    );

    it('should fail at creating account (invalid full name)', () =>
      createAccount({
        fullname: Array(50).fill('bullshit').join('')
      })
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'fullnameIsInvalid');
        })
    );

    it('should create a account', () =>
      createAccount()
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, true);
        })
    );

  });
  
  // ################
  //  edit account
  // ################

  describe('edit account', function () {

    it('should fail at editing account (not logged in)', () =>
      fetch('/api/v1/account', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(getMockData())
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'unauthorized');
        })
    );

    it('should fail at editing account (no json)', () =>
      fetchWithToken('/api/v1/account', { method: 'PATCH' })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(/IsRequired/.test(json.error), true);
        })
    );

    it('should fail at editing account (empty json)', () =>
      fetchWithToken('/api/v1/account', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(/IsRequired/.test(json.error), true);
        })
    );

    it('should fail at editing account (invalid username)', () => 
      editAccount({
        username: '(invalid username)'
      })
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'usernameIsInvalid');
        })
    );

    it('should fail at editing account (invalid email)', () => 
      editAccount({
        email: 'this is an invalid email'
      })
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'emailIsInvalid');
        })
    );

  });

});
