const User = require('../config/schemas/User');

// #################
//  mock data stuff
// #################

const getRandomUsername = () =>
  '000000000'.replace(/0/g, () => (~~(Math.random()*16)).toString(16));

const getRandomPassword = getRandomUsername;

const getRandomEmail = () =>
  '000000@000000'.replace(/0/g, () => (~~(Math.random()*16)).toString(16));

const getMockData = () => ({
  username: getRandomUsername(),
  email: getRandomEmail(),
  fullname: getRandomUsername(),
  password: getRandomPassword(),
  name: getRandomUsername(),
  joinName: getRandomUsername()
});

// #################
//  make fetch func with server address
// #################

const fetch = (path, settings) => require('node-fetch')(global.__SERVER_ADDRESS__ + path, settings);

// #################
//  session stuff
// #################

const logIn = userData =>
  fetch('/api/v1/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
    .then(res => res.json());

const getRandomToken = async () => {
  const user = await createAccountViaSchema();

  return await logIn({
    username: user.username,
    password: user.password
  })
    .then(json => json.token);
};

// #################
//  account stuff
// #################

const createAccount = (dataOverride = {}) =>
  fetch('/api/v1/account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ...getMockData(), ...dataOverride })
  })
    .then(res => res.json());

const createAccountViaSchema = async (dataOverride = {}) => {
  const data = { ...getMockData(), ...dataOverride };

  const user = new User({
    username: data.username,
    email: data.email
  });
  user.setPassword(data.password);
  await user.save();

  return { ...data, ...user._doc };
};

module.exports = {
  fetch, logIn, createAccount, createAccountViaSchema,
  getRandomToken, getMockData };