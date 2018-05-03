const mongoose = require('mongoose');

module.exports = {
  connect: async DB_HOST_OVERRIDE => {
    const DB_HOST = DB_HOST_OVERRIDE || require('../config.js').DB_HOST;

    await mongoose.connect(DB_HOST);

    await Promise.all([
      require('./schemas/User').init(),
      require('./schemas/Group').init(),
      require('./schemas/Homework').init(),
    ]);
  },
  disconnect: () => mongoose.disconnect()
};