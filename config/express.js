const { SESSION_SECRET, PORT } = require('../config.js');

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');

const app = express();

let server;

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

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://homework-manager.ga');
  res.header('Access-Control-Allow-Origin', 'https://beta.homework-manager.ga');
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', 'true');
  // don't do this, this is not safe
  // res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  next();
});

require('./routes')(app);

module.exports = {
  app,
  getServer: () => {
    if (!server) throw new Error('can\'t get server if not listening');
    return server;
  },
  listen: () => new Promise((resolve, reject) => {
    server = app.listen(PORT, () => {
      console.log(`listening @ port ${PORT}`)
      resolve(server);
    });
  }),
  stop: () => new Promise((resolve, reject) => {
    server.close(() => {
      resolve();
    });
  })
};