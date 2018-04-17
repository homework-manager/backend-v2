module.exports = (function () {
  let config = {};

  config.SALT_LENGTH = 10; // u salty boi

  config.regexps = {
    username: /^[A-Z0-9_.]{1,16}$/i,
    fullname: /^.{1,200}$/,
    password: /^.{6,}$/,
    email: /^[A-Z0-9._%+-]{1,32}@[A-Z0-9._]{4,32}$/i
  };

  config.PORT = process.env.PORT || 8000;
  config.DB_HOST = process.env.DB_HOST || 'mongodb://localhost/hwmv2';

  if (!process.env.SESSION_SECRET) {
    console.log('no SESSION_SECRET variable, falling back to development default')
  }
  config.SESSION_SECRET = process.env.SESSION_SECRET || 'dev waffles :D';

  return config;
})();