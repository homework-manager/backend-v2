const assert = require('assert');

const {
  fetch, fetchWithToken,
  getMockData, logIn,
  editAccount, createAccountViaSchema,
  createAccount } = require('./__helperFunctions__');
const User = require('../config/schemas/User');

describe('account', function () {

  // ################
  //  get account
  // ################

  describe('get account', function () {

    it('should fail at getting account (no token)', () =>
      fetch('/api/v1/account', { method: 'GET' })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'unauthorized');
        })
    );

    it('should fail at getting account (fake/expired token)', () =>
      fetch('/api/v1/account', {
        method: 'GET',
        headers: {
          'Authorization': 'not a token, that\'s for sure'
        }
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'unauthorized');
        })
    );

    it('should get account', async () => {
      const data = getMockData();

      const account = await createAccountViaSchema(data);
      const token = (await logIn(data)).token;

      return await fetch('/api/v1/account', {
        method: 'GET',
        headers: {
          'Authorization': token
        }
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, true);
          assert.equal(json.profile._id, account._id);
          assert.strictEqual(json.profile.username, data.username);
          assert.strictEqual(json.profile.email, data.email);
          assert.strictEqual(json.profile.fullname, data.fullname);
        })
    });

  });

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

    it('should fail at creating account (invalid fullname)', () =>
      createAccount({ fullname: Array(50).fill('bullshit').join('') })
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'fullnameIsInvalid');
        })
    );

    it('should create a account', async () => {
      const data = getMockData();

      return await createAccount(data)
        .then(async json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, true);
          assert.strictEqual(json.profile.username, data.username);
          assert.strictEqual(json.profile.email, data.email);
          assert.strictEqual(json.profile.fullname, data.fullname);
            
          const userViaUsername = await User.findOne({ username: data.username });
          assert.strictEqual(typeof userViaUsername, 'object');
          assert.strictEqual(userViaUsername.email, data.email);
          assert.strictEqual(userViaUsername.fullname, data.fullname);

          const userViaId = await User.findOne({ _id: json.profile._id });
          assert.strictEqual(typeof userViaId, 'object');
          assert.strictEqual(userViaId.email, data.email);
          assert.strictEqual(userViaId.fullname, data.fullname);
        })
    });

  });
  
  // ################
  //  edit account
  // ################

  describe('edit account', function () {

    it('should fail at editing account (not logged in)', () =>
      fetch('/api/v1/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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

    it('should fail at editing account (invalid username)', () => 
      editAccount({ username: '(invalid username)' })
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'usernameIsInvalid');
        })
    );

    it('should fail at editing account (invalid email)', () => 
      editAccount({ email: 'this is an invalid email' })
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'emailIsInvalid');
        })
    );

    it('should fail at editing account (invalid fullname)', () => 
      editAccount({ fullname: Array(50).fill('bullshit').join('') })
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'fullnameIsInvalid');
        })
    );

    it('should edit account', async () => {
      const data = getMockData();

      return await editAccount(data)
        .then(async json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, true);
          assert.strictEqual(json.profile.username, data.username);
          assert.strictEqual(json.profile.email, data.email);
          assert.strictEqual(json.profile.fullname, data.fullname);
          
          const userViaUsername = await User.findOne({ username: data.username });
          assert.strictEqual(typeof userViaUsername, 'object');
          assert.strictEqual(userViaUsername.email, data.email);
          assert.strictEqual(userViaUsername.fullname, data.fullname);

          const userViaId = await User.findOne({ _id: json.profile._id });
          assert.strictEqual(typeof userViaId, 'object');
          assert.strictEqual(userViaId.email, data.email);
          assert.strictEqual(userViaId.fullname, data.fullname);
        })
    });

  });

});
