module.exports = async () => {
  const { DB_HOST } = require('../config.js');

  const mongoose = require('mongoose');

  await mongoose.connect(DB_HOST);

  await Promise.all([
    require('./schemas/User').init(),
    require('./schemas/Group').init(),
    require('./schemas/Homework').init(),
  ]);
};