module.exports = app => {
  require('./login.js')(app);
  require('./account.js')(app);
  require('./group.js')(app);
  // require('./homework.js')(app);
};