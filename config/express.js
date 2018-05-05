const config = require('../config.js');
const { SESSION_SECRET } = config;
const PORT_ENV = config.PORT;

const express = require('express');
const timeout = require('connect-timeout');
const passport = require('passport');
const bodyParser = require('body-parser');

const app = express();

let server;

app.use(bodyParser.json());
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

app.use(timeout(8000));
app.use((req, res, next) => {
  if (!req.timedout) next();
});

app.use((err, req, res, next) => {
  if (err) res.status(500).json({ success: false, error: 'server' });
  else next();
});

module.exports = {
  app,
  getServer: () => {
    if (!server) throw new Error('can\'t get server if not listening');
    return server;
  },
  listen: (PORT_OVERRIDE, log = true) => new Promise((resolve, reject) => {
    const PORT = PORT_OVERRIDE !== undefined ? PORT_OVERRIDE : PORT_ENV;
    if (log) app.use(require('morgan')('combined'));
    server = app.listen(PORT, () => {
      if (log) console.log(`listening @ port ${server.address().port}`)
      resolve(server);
    });
  }),
  stop: () => new Promise((resolve, reject) => {
    if (!server) throw new Error('can\'t stop server if not listening');
    server.close(() => {
      resolve();
    });
  })
};