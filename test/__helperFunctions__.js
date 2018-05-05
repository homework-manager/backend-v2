const User = require('../config/schemas/User');

const getRandomUsername = () =>
  '000000000'.replace(/0/g, () => (~~(Math.random()*16)).toString(16));

const getRandomPassword = getRandomUsername;

const getRandomEmail = () =>
  '000000@000000'.replace(/0/g, () => (~~(Math.random()*16)).toString(16));


const fetch = (path, settings) => require('node-fetch')(global.__SERVER_ADDRESS__ + path, settings);

const logIn = userData =>
  fetch('/api/v1/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
    .then(res => res.json());

const createAccount = userData =>
  fetch('/api/v1/account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
    .then(res => res.json());

const createAccountViaSchema = async () => {
  const password = getRandomPassword();

  const user = new User({
    username: getRandomUsername(),
    email: getRandomEmail()
  });
  user.setPassword(password);
  await user.save();
  return { ...user._doc, password };
};

const getRandomToken = async () => {
  const user = await createAccountViaSchema();

  return await logIn({
    username: user.username,
    password: user.password
  })
    .then(json => json.token);
};

const getMockData = () => ({
  username: getRandomUsername(),
  email: getRandomEmail(),
  fullname: getRandomUsername(),
  password: getRandomPassword()
});

module.exports = {
  fetch, logIn, createAccount, createAccountViaSchema,
  getRandomToken, getMockData };