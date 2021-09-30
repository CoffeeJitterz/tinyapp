const { assert } = require('chai');

const helpers = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = helpers.findUserByEmail("user@example.com", testUsers);
    const expectedOutput = {id: 'userRandomID', email: 'user@example.com', password: 'purple-monkey-dinosaur'};
    assert.deepEqual(user, expectedOutput)
  });

  it('should return false if email is not valid', () => {
    const user = helpers.findUserByEmail("invalid@example.com", testUsers);
    assert.isFalse(user);
  })
});