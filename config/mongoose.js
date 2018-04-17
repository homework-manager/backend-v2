module.exports = async () => {
  const { DB_HOST } = require('../config.js');

  const mongoose = require('mongoose');

  await mongoose.connect(DB_HOST);
};