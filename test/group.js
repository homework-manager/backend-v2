const assert = require('assert');
const mongoose = require('mongoose');

const {
  fetch, fetchWithToken,
  createGroup, createGroupViaSchema,
  createAccountViaSchema, logIn,
  getMockData } = require('./__helperFunctions__');
const Group = require('../config/schemas/Group');

describe('group', function () {

  describe('create group', function () {

    it('should fail at creating group (no json)', () =>
      fetchWithToken('/api/v1/group', { method: 'POST' })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(/IsRequired/.test(json.error), true);
        })
    );

    it('should fail at creating group (empty json)', () =>
      fetchWithToken('/api/v1/group', {
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

    it('should fail at creating group (invalid name)', () =>
      createGroup({ name: Array(50).fill('bullshit').join('') })
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'nameIsInvalid');
        })
    );

    it('should fail at creating group (invalid joinName)', () =>
      createGroup({ joinName: Array(50).fill('bullshit').join('') })
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'joinNameIsInvalid');
        })
    );

    it('should create group', async () => {
      const data = getMockData();

      const account = await createAccountViaSchema({
        username: data.username,
        email: data.email,
        password: data.password
      });
      const token = (await logIn(data)).token;

      return await createGroup(data, token)
        .then(async json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, true);
          assert.strictEqual(json.group.name, data.name);
          assert.strictEqual(json.group.joinName, data.joinName);
          assert.equal(json.group.members[0].id, account._id);

          const groupViaJoinName = await Group.findOne({ joinName: data.joinName });
          assert.strictEqual(typeof groupViaJoinName, 'object');
          assert.strictEqual(groupViaJoinName.name, data.name);
          assert.equal(groupViaJoinName._id, json.group._id);
          assert.equal(account._id, String(groupViaJoinName.members[0].id));

          const groupViaId = await Group.findOne({ _id: json.group._id });
          assert.strictEqual(typeof groupViaId, 'object');
          assert.strictEqual(groupViaId.name, data.name);
          assert.strictEqual(groupViaId.joinName, data.joinName);
          assert.equal(account._id, String(groupViaId.members[0].id));
        });
    });

  });

  describe('join group', function () {

    describe('via joinName', function () {

      it('should fail at joining a group (no group with that joinName)', () =>
        fetchWithToken('/api/v1/group/join/noGroupWithJoinName', { method: 'POST' })
          .then(res => res.json())
          .then(json => {
            assert.strictEqual(typeof json, 'object');
            assert.strictEqual(json.success, false);
            assert.strictEqual(json.error, 'groupNotFound');
          })
      );

      it('should join group', async () => {
        const group = await createGroupViaSchema();

        return await fetchWithToken(`/api/v1/group/join/${group.joinName}`, 
          { method: 'POST' }
        )
          .then(res => res.json())
          .then(json => {
            console.log(json)
            assert.strictEqual(typeof json, 'object');
            assert.strictEqual(json.success, true);
            
            assert.equal(json.group._id, group._id);
            assert.strictEqual(json.group.name, group.name);
            assert.strictEqual(json.group.joinName, group.joinName);
          });
      });

    });

  });

});