const MongodbMemoryServer = require('mongodb-memory-server');
const mongoose = require('mongoose');

const expressApp = require('../config/express');

const MONGO_DB_NAME = 'test-hwmv2';

let mongod, mongoAddress;

before('start in-memory mongo server', async () => {
  mongod = new MongodbMemoryServer.default({
    instance: {
      dbName: MONGO_DB_NAME
    },
    binary: {
      version: '3.2.19'
    }
  });

  mongoAddress = await mongod.getConnectionString();
});

before('connect mongoose to in-memory mongo server', async () => {
  await require('../config/mongoose').connect(mongoAddress);
});

before('start express server', async () => {
  const server = await expressApp.listen(0, false);
  const port = server.address().port;
  global.__SERVER_ADDRESS__ = `http://127.0.0.1:${port}`;
  await require('../config/passport')();
});

beforeEach('drop db', () => mongoose.connection.dropDatabase());

after('stop express server', () => expressApp.stop());

after('disconnect mongoose from in-memory mongo server', () => mongoose.disconnect());

after('stop in-memory mongo server', () => mongod.stop());
