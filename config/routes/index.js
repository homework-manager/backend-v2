module.exports = app => {
  require('./login.js')(app);
  require('./account.js')(app);
};