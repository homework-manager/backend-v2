const NodeEnvironment = require('jest-environment-node');
const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');
const mongoose = require('mongoose');

const { app } = require('../config/express');

class TestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    this.global.__MONGO_URI__ = await global.__MONGOD__.getConnectionString();
    this.global.__MONGO_DB_NAME__ = global.__MONGO_DB_NAME__;

    // await mongoose.connect(this.global.__MONGO_URI__);

    // await Promise.all([
    //   require('../config/schemas/User').init(),
    //   require('../config/schemas/Group').init(),
    //   require('../config/schemas/Homework').init(),
    // ]);

    mongoose.set('bufferCommands', false);
    await require('../config/mongoose').connect(this.global.__MONGO_URI__);
    await require('../config/passport')();

    this.global.__MONGOOSE_INSTANCE__ = mongoose;

    await new Promise((resolve, reject) => {
      this.global.__HTTP_SERVER__ = app.listen(0, () => {
        this.global.__PORT__ = this.global.__HTTP_SERVER__.address().port;
        this.global.__SERVER_ADDRESS__ = `http://127.0.0.1:${this.global.__PORT__}`;
        this.global.__FETCH_FUNC__ = (path, settings) =>
          fetch(this.global.__SERVER_ADDRESS__ + path, settings);
        resolve();
      });
    });

    this.global.__MONGO_CONNECTION__ = await MongoClient.connect(this.global.__MONGO_URI__);
    this.global.__MONGO_CLIENT__ = this.global.__MONGO_CONNECTION__.db();

    await super.setup();
  }

  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = TestEnvironment;
