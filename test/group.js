const assert = require('assert');
const mongoose = require('mongoose');

const {
  fetch, fetchWithToken,
  createGroup,
  getMockData } = require('./__helperFunctions__');

describe('group', function () {
  beforeEach('clear database', () => mongoose.connection.dropDatabase());

  it('should fail at creating group (no json)', () =>
    fetchWithToken('/api/v1/group', { method: 'POST' })
      .then(res => res.json())
      .then(json => {
        assert.equal(typeof json, 'object');
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
        assert.equal(typeof json, 'object');
        assert.strictEqual(json.success, false);
        assert.strictEqual(/IsRequired/.test(json.error), true);
      })
  );
});