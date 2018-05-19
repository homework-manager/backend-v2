const assert = require('assert');
const mongoose = require('mongoose');

const {
  getMockData,
  fetch, fetchWithToken,
  createGroupViaSchema, createAccountViaSchema,
  createHomeworkViaSchema,
  logIn } = require('./__helperFunctions__');
const Group = require('../config/schemas/Group');
const Homework = require('../config/schemas/Homework');

describe('homework', function () {

  let account1, account2, account3,
    token1, token2, token3,
    group, homework, homeworkDoc;

  beforeEach(async function () {
    account1 = await createAccountViaSchema();
    account2 = await createAccountViaSchema();
    account3 = await createAccountViaSchema();
    token1 = (await logIn(account1)).token;
    token2 = (await logIn(account2)).token;
    token3 = (await logIn(account3)).token;

    group = await createGroupViaSchema({
      members: [
        { id: account1._id, roles: [ { admin: true } ] },
        { id: account2._id                             }
      ]
    });

    homework = await createHomeworkViaSchema({
      groupId: group._id,
      createdBy: account1._id
    });

    homeworkDoc = await Homework.findById(homework._id);    
  });

  // #########################################################
  // #########################################################
  // #########################################################
  
  describe('create homework', function () {

    it('should fail at creating homework (no json)', () =>
      fetch(`/api/v1/homework`, {
        method: 'PUT',
        headers: {
          'Authorization': token1
        }
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(/IsRequired$|^groupNotFound$/.test(json.error), true);
        })
    );

    it('should fail at creating homework (empty json)', () =>
      fetch(`/api/v1/homework`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token1
        },
        body: JSON.stringify({})
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(/IsRequired$|^groupNotFound$/.test(json.error), true);
        })
    );

    it('should fail at creating homework (invalid title)', () =>
      fetch(`/api/v1/homework`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token1
        },
        body: JSON.stringify({
          ...getMockData(),
          groupId: group._id,
          title: Array(50).fill('bullshit').join('')
        })
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'titleIsInvalid');
        })
    );

    it('should fail at creating homework (invalid description)', () =>
      fetch(`/api/v1/homework`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token1
        },
        body: JSON.stringify({
          ...getMockData(),
          groupId: group._id,
          description: Array(2000).fill('bullshit').join('')
        })
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'descriptionIsInvalid');
        })
    );

    it('should fail at creating homework (user is not admin)', () =>
      fetch(`/api/v1/homework`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token2
        },
        body: JSON.stringify({
          ...getMockData(),
          groupId: group._id
        })
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'forbidden');
        })
    );

    it('should fail at creating homework (user is not in group)', () =>
      fetch(`/api/v1/homework`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token3
        },
        body: JSON.stringify({
          ...getMockData(),
          groupId: group._id
        })
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'forbidden');
        })
    );

    it('should create homework', async () => {
      const data = {
        ...getMockData(),
        groupId: group._id
      };
      
      return await fetch(`/api/v1/homework`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token1
        },
        body: JSON.stringify(data)
      })
        .then(res => res.json())
        .then(async json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, true);

          assert.equal(account1._id, json.homework.createdBy);
          assert.equal(group._id, json.homework.groupId);
          assert.strictEqual(json.homework.title, data.title);
          assert.strictEqual(json.homework.description, data.description);

          const homeworkViaId = await Homework.findById(json.homework._id);
          assert.strictEqual(account1._id.equals(homeworkViaId.createdBy), true);
          assert.strictEqual(group._id.equals(homeworkViaId.groupId), true);
          assert.strictEqual(homeworkViaId.title, data.title);
          assert.strictEqual(homeworkViaId.description, data.description);
        });
    });

  });

  // #########################################################
  // #########################################################
  // #########################################################

  describe('edit homework', function () {

    it('should fail at editing homework (non existing id)', () =>
      fetch(`/api/v1/homework/asdasdads`, {
        method: 'PATCH',
        headers: {
          'Authorization': token1
        }
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'homeworkNotFound');
        })
    );

    it('should fail at editing homework (invalid title)', () =>
      fetch(`/api/v1/homework/${homework._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token1
        },
        body: JSON.stringify({
          ...homework,
          title: Array(50).fill('bullshit').join('')
        })
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'titleIsInvalid');
        })
    );

    it('should fail at editing homework (invalid description)', () =>
      fetch(`/api/v1/homework/${homework._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token1
        },
        body: JSON.stringify({
          ...homework,
          description: Array(2000).fill('bullshit').join('')
        })
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'descriptionIsInvalid');
        })
    );

    it('should fail at editing homework (user is not admin)', () =>
      fetch(`/api/v1/homework/${homework._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token2
        },
        body: JSON.stringify({
          ...homework,
          ...getMockData
        })
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'forbidden');
        })
    );

    it('should fail at editing homework (user is not in group)', () =>
      fetch(`/api/v1/homework/${homework._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token3
        },
        body: JSON.stringify({
          ...homework,
          ...getMockData
        })
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'forbidden');
        })
    );

    it('should edit homework', async () => {
      const data = {
        ...homework,
        ...getMockData()
      };
      
      return await fetch(`/api/v1/homework/${homework._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token1
        },
        body: JSON.stringify(data)
      })
        .then(res => res.json())
        .then(async json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, true);

          assert.equal(homework._id, json.homework._id);
          assert.equal(account1._id, json.homework.createdBy);
          assert.equal(group._id, json.homework.groupId);
          assert.strictEqual(json.homework.title, data.title);
          assert.strictEqual(json.homework.description, data.description);

          const homeworkViaId = await Homework.findById(homework._id);
          assert.strictEqual(account1._id.equals(homeworkViaId.createdBy), true);
          assert.strictEqual(group._id.equals(homeworkViaId.groupId), true);
          assert.strictEqual(homeworkViaId.name, json.homework.name);
          assert.strictEqual(homeworkViaId.description, json.homework.description);
        })
    });

  });

  // #########################################################
  // #########################################################
  // #########################################################

  describe('mark homework as done', function () {

    it('should fail at marking homework as done (non existing id)', () =>
      fetch(`/api/v1/homework/asdasdads/done`, {
        method: 'POST',
        headers: {
          'Authorization': token1
        }
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'homeworkNotFound');
        })
    );

    it('should fail at marking homework as done (user is not in group)', () =>
      fetch(`/api/v1/homework/${homework._id}/done`, {
        method: 'POST',
        headers: {
          'Authorization': token3
        }
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'forbidden');
        })
    );

    it('should mark homework as done', () =>
      fetch(`/api/v1/homework/${homework._id}/done`, {
        method: 'POST',
        headers: {
          'Authorization': token1
        }
      })
        .then(res => res.json())
        .then(async json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, true);

          assert.equal(homework._id, json.homework._id);
          assert.equal(account1._id, json.homework.createdBy);
          assert.equal(group._id, json.homework.groupId);
          assert.strictEqual(json.homework.title, homework.title);
          assert.strictEqual(json.homework.description, homework.description);
          assert.strictEqual(json.homework.doneBy.length, 1);
          assert.strictEqual(account1._id.equals(json.homework.doneBy[0]), true);

          const homeworkViaId = await Homework.findById(homework._id);
          assert.strictEqual(account1._id.equals(homeworkViaId.createdBy), true);
          assert.strictEqual(group._id.equals(homeworkViaId.groupId), true);
          assert.strictEqual(homeworkViaId.name, json.homework.name);
          assert.strictEqual(homeworkViaId.description, json.homework.description);
          assert.strictEqual(homeworkViaId.doneBy.length, 1);
          assert.strictEqual(homeworkViaId.doneBy[0].equals(account1._id), true);
        })
    );

  });

  // #########################################################
  // #########################################################
  // #########################################################

  describe('mark homework as not done', function () {

    beforeEach(async function () {
      homeworkDoc.markUserAsDone(account1._id);
      homeworkDoc.markUserAsDone(account2._id);

      await homeworkDoc.save();
    });

    it('should fail at marking homework as not done (non existing id)', () =>
      fetch(`/api/v1/homework/asdasdads/notDone`, {
        method: 'POST',
        headers: {
          'Authorization': token1
        }
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'homeworkNotFound');
        })
    );

    it('should fail at marking homework as not done (user is not in group)', () =>
      fetch(`/api/v1/homework/${homework._id}/notDone`, {
        method: 'POST',
        headers: {
          'Authorization': token3
        }
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'forbidden');
        })
    );

    it('should mark homework as not done', () =>
      fetch(`/api/v1/homework/${homework._id}/notDone`, {
        method: 'POST',
        headers: {
          'Authorization': token1
        }
      })
        .then(res => res.json())
        .then(async json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, true);

          assert.equal(homework._id, json.homework._id);
          assert.equal(account1._id, json.homework.createdBy);
          assert.equal(group._id, json.homework.groupId);
          assert.strictEqual(json.homework.title, homework.title);
          assert.strictEqual(json.homework.description, homework.description);
          assert.strictEqual(json.homework.doneBy.length, 1);
          assert.strictEqual(account1._id.equals(json.homework.doneBy[0]), false);

          const homeworkViaId = await Homework.findById(homework._id);
          assert.strictEqual(account1._id.equals(homeworkViaId.createdBy), true);
          assert.strictEqual(group._id.equals(homeworkViaId.groupId), true);
          assert.strictEqual(homeworkViaId.name, json.homework.name);
          assert.strictEqual(homeworkViaId.description, json.homework.description);
          assert.strictEqual(homeworkViaId.doneBy.length, 1);
          assert.strictEqual(homeworkViaId.doneBy[0].equals(account1._id), false);
        })
    );

  });

  // #########################################################
  // #########################################################
  // #########################################################

  describe('delete homework', function () {

    it('should fail at deleting homework (non existing id)', () =>
      fetch(`/api/v1/homework/asdasdads`, {
        method: 'DELETE',
        headers: {
          'Authorization': token1
        }
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'homeworkNotFound');
        })
    );

    it('should fail at deleting homework (user is not admin)', () =>
      fetch(`/api/v1/homework/${homework._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token2
        }
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'forbidden');
        })
    );

    it('should fail at deleting homework (user is not in group)', () =>
      fetch(`/api/v1/homework/${homework._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token3
        }
      })
        .then(res => res.json())
        .then(json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, false);
          assert.strictEqual(json.error, 'forbidden');
        })
    );

    it('should delete homework', () =>
      fetch(`/api/v1/homework/${homework._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token1
        }
      })
        .then(res => res.json())
        .then(async json => {
          assert.strictEqual(typeof json, 'object');
          assert.strictEqual(json.success, true);

          const homeworkViaId = await Homework.findById(homework._id);

          assert.equal(homeworkViaId, undefined);
        })
    );

  });

});