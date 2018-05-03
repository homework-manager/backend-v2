const { logIn, insertTestUser } = require('../testsetup/utils');

const mongoose = require('mongoose');

test('logs in succesfully', async () => {
  expect.assertions(1);
  await require('../config/mongoose').connect(global.__MONGO_URI__);

  const [username, password, email] =
    ['testUsername', 'testPassword', 'test@e.mail'];

  console.log('asdasda' + global.__MONGOOSE_INSTANCE__.connection.readyState )
  await global.__MONGO_CLIENT__.dropDatabase();
  console.log('asdasda' + global.__MONGOOSE_INSTANCE__.connection.readyState )
  await insertTestUser({ username, password, email });
  console.log('asdasda' + global.__MONGOOSE_INSTANCE__.connection.readyState )
  console.log(await global.__MONGO_CLIENT__.collection('users').find({}).toArray())

  await logIn({ username, password })
    .then(res => res.json())
    .then(json => {
      console.log(json)
      expect(json).toBeDefined();
      expect(json.success).toBeTruthy();

    });

  return;
});
