module.exports = () => new Promise((resolve, reject) => {
  const { SESSION_SECRET, PORT } = require('../config.js');

  const express = require('express');
  const session = require('express-session');
  const passport = require('passport');
  const bodyParser = require('body-parser');

  const app = express();

  app.use(require('morgan')('combined'));
  app.use(bodyParser.json());
  app.use(require('cookie-parser')());
  app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  require('./routes')(app);

  app.listen(PORT, () => {
    console.log(`listening @ port ${PORT}`)
    resolve();
  });
});