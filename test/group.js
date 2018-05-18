const assert = require('assert');
const mongoose = require('mongoose');

const {
  fetch, fetchWithToken,
  createGroup, createGroupViaSchema,
  createAccountViaSchema, logIn,
  getMockData } = require('./__helperFunctions__');
const Group = require('../config/schemas/Group');

describe('group', function () {

  // #########################################################
  // #########################################################
  // #########################################################
  
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

  // #########################################################
  // #########################################################
  // #########################################################

  describe('edit group', function () {

    let account, token, group;

    beforeEach(async function () {
      account = await createAccountViaSchema();
      token = (await logIn(account)).token;

      group = await createGroupViaSchema({
        members: [ { id: account._id, roles: [ { admin: true } ] } ]
      });
    });

    it('should fail at editing group (no json)', async () => {
      return await fetch(`/api/v1/group/${group._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': token
        }
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(/IsRequired/.test(json.error), true);
        })
    });

    it('should fail at editing group (empty json)', async () => {
      return await fetch(`/api/v1/group/${group._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({})
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(/IsRequired/.test(json.error), true);
        })
    });

    it('should fail at editing group (invalid name)', async () => {
      return await fetch(`/api/v1/group/${group._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          ...getMockData(),
          name: Array(50).fill('bullshit').join('')
        })
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'nameIsInvalid');
        });
    });

    it('should fail at creating group (invalid joinName)', async () => {
      return await fetch(`/api/v1/group/${group._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          ...getMockData(),
          joinName: Array(50).fill('bullshit').join('')
        })
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'joinNameIsInvalid');
        });
    });

    it('should edit group', async () => {
      const newData = getMockData();

      return await fetch(`/api/v1/group/${group._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(newData)
      })
        .then(res => res.json())
        .then(async json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, true);

          assert.equal(json.group._id, group._id);
          assert.strictEqual(json.group.name, newData.name);
          assert.strictEqual(json.group.joinName, newData.joinName);

          const groupViaId = await Group.findById(group._id);
          assert.strictEqual(groupViaId.name, json.group.name);
          assert.strictEqual(groupViaId.joinName, json.group.joinName);

          const groupViaJoinName = await Group.findOne({ joinName: json.group.joinName });
          assert.equal(json.group._id, groupViaJoinName._id);
          assert.strictEqual(groupViaJoinName.name, json.group.name);
        });
    });

  });

  // #########################################################
  // #########################################################
  // #########################################################

  describe('join group', function () {

    // #########################################################
    // #########################################################
    // #########################################################
    
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
            assert.strictEqual(typeof json, 'object');
            assert.strictEqual(json.success, true);

            assert.equal(json.group._id, group._id);
            assert.strictEqual(json.group.name, group.name);
            assert.strictEqual(json.group.joinName, group.joinName);
          });
      });

    });

    // #########################################################
    // #########################################################
    // #########################################################

  });

  // #########################################################
  // #########################################################
  // #########################################################

  describe('get members from a group', function () {

    it('should get members from a group', async () => {
      const user = await createAccountViaSchema();

      const group = await createGroupViaSchema({
        members: [ { id: user._id, roles: [ { admin: true } ] } ]
      });

      return await fetch(`/api/v1/group/${group._id}/members`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': (await logIn(user)).token }
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, true);

          assert.equal(json.members[0]._id, user._id);
          assert.strictEqual(json.members[0].username, user.username);
          assert.strictEqual(json.members[0].fullname, user.fullname);
        });
    });

  });

  // #########################################################
  // #########################################################
  // #########################################################
  
  describe('remove admin from user in a group', function () {

    it('should fail at removing admin from user (group doesn\'t exist)', async () => {
      const adminUser = await createAccountViaSchema();
      const normalUser = await createAccountViaSchema();

      return await fetch(`/api/v1/group/${adminUser._id}/removeAdminFromMember`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': (await logIn(adminUser)).token
        },
        body: JSON.stringify({ memberId: normalUser })
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'groupNotFound');
        });
    });

    it('should fail at removing admin from user (user not in group)', async () => {
      const adminUser = await createAccountViaSchema();
      const normalUser = await createAccountViaSchema();

      const group = await createGroupViaSchema({
        members: [ { id: adminUser._id , roles: [ { admin: true } ] } ]
      });

      return await fetch(`/api/v1/group/${group._id}/removeAdminFromMember`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': (await logIn(adminUser)).token
        },
        body: JSON.stringify({ memberId: normalUser })
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'memberDoesntExist');
        });
    });

    it('should fail at removing admin from user (user doesn\'t exist)', async () => {
      const adminUser = await createAccountViaSchema();

      const group = await createGroupViaSchema({
        members: [ { id: adminUser._id , roles: [ { admin: true } ] } ]
      });

      return await fetch(`/api/v1/group/${group._id}/removeAdminFromMember`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': (await logIn(adminUser)).token
        },
        body: JSON.stringify({ memberId: group._id })
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'memberDoesntExist');
        });
    });

    it('should remove admin from user', async () => {
      const adminUser = await createAccountViaSchema();
      const normalUser = await createAccountViaSchema();

      const group = await createGroupViaSchema({
        members: [ { id: adminUser._id , roles: [ { admin: true } ] },
                   { id: normalUser._id, roles: [ { admin: true } ] } ]
      });

      return await fetch(`/api/v1/group/${group._id}/removeAdminFromMember`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': (await logIn(adminUser)).token
        },
        body: JSON.stringify({ memberId: normalUser })
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'memberDoesntExist');
        });
    });

  });

  // #########################################################
  // #########################################################
  // #########################################################

  describe('give admin to user in a group', function () {

    it('should fail at giving admin to user (group doesn\'t exist)', async () => {
      const adminUser = await createAccountViaSchema();
      const normalUser = await createAccountViaSchema();

      return await fetch(`/api/v1/group/${adminUser._id}/makeMemberAdmin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': (await logIn(adminUser)).token
        },
        body: JSON.stringify({ memberId: normalUser })
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'groupNotFound');
        });
    });

    it('should fail at giving admin to user (user not in group)', async () => {
      const adminUser = await createAccountViaSchema();
      const normalUser = await createAccountViaSchema();

      const group = await createGroupViaSchema({
        members: [ { id: adminUser._id , roles: [ { admin: true } ] } ]
      });

      return await fetch(`/api/v1/group/${group._id}/makeMemberAdmin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': (await logIn(adminUser)).token
        },
        body: JSON.stringify({ memberId: normalUser })
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'memberDoesntExist');
        });
    });

    it('should fail at giving admin to user (user doesn\'t exist)', async () => {
      const adminUser = await createAccountViaSchema();

      const group = await createGroupViaSchema({
        members: [ { id: adminUser._id , roles: [ { admin: true } ] } ]
      });

      return await fetch(`/api/v1/group/${group._id}/makeMemberAdmin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': (await logIn(adminUser)).token
        },
        body: JSON.stringify({ memberId: group._id })
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'memberDoesntExist');
        });
    });

    it('should give admin to user', async () => {
      const adminUser = await createAccountViaSchema();
      const normalUser = await createAccountViaSchema();

      const group = await createGroupViaSchema({
        members: [ { id: adminUser._id , roles: [ { admin: true } ] },
                   { id: normalUser._id                             } ]
      });

      return await fetch(`/api/v1/group/${group._id}/removeAdminFromMember`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': (await logIn(adminUser)).token
        },
        body: JSON.stringify({ memberId: normalUser })
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'memberDoesntExist');
        });
    });

  });

});