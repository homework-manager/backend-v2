module.exports = async function() {
  await require('../config/mongoose').disconnect();
  await global.__MONGOD__.stop();
};
