;(async function () {})()
  .then(async function () {
    try {
      await require('./config/mongoose')();
      await require('./config/passport')();
      await require('./config/express')();
      console.log('finished init')
    } catch (error) {
      console.log('FUCK', error)
      process.exit(0);
    }
  });

console.log('initializing...')