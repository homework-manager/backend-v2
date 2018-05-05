module.exports = (() => new Promise(async (resolve, reject) => {
  try {
    console.log('initializing...')
    await require('./config/mongoose').connect();
    await require('./config/passport')();
    await require('./config/express').listen();
    console.log('finished init')
    resolve();
  } catch (error) {
    console.log('FUCK', error)
    reject();
  }
}));

if (require.main === module) {
  module.exports().catch(error => process.exit(0));
}
