const User = require('../config/schemas/User');
const Group = require('../config/schemas/Group');

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
//  generic stuff
// #################

const createUsingAPI = (name, method, genToken = false) => async (dataOverride = {}) => {
  return await fetch(`/api/v1/${name}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': genToken ? await getRandomToken() : undefined
    },
    body: JSON.stringify({ ...getMockData(), ...dataOverride })
  })
    .then(res => res.json());
};

const createUsingSchema = schema => async (dataOverride = {}) => {
  const data = { ...getMockData(), ...dataOverride };

  const thing = new User(data);
  if (thing.setPassword) thing.setPassword(data.password);
  await thing.save();

  return { ...data, ...thing._doc };
};

// #################
//  session stuff
// #################

const logIn = createUsingAPI('session', 'POST');

const getRandomToken = async () => {
  const user = await createAccountViaSchema();

  return await logIn({
    username: user.username,
    password: user.password
  })
    .then(json => json.token);
};

const fetchWithToken = async (path, settings) => {
  return await fetch(path, {
    ...settings,
    headers: {
      ...(settings.headers || {}),
      'Authorization': await getRandomToken()
    }
  });
};

// #################
//  account stuff
// #################

const createAccount = createUsingAPI('account', 'POST');

const createAccountViaSchema = createUsingSchema(User);

const editAccount = createUsingAPI('account', 'PATCH', true);

// #################
//  group stuff
// #################

const createGroup = createUsingAPI('group', 'POST', true);

const createGroupViaSchema = createUsingSchema(Group);

// #################
//  export everything
// #################

module.exports = {
  getMockData, fetch, fetchWithToken,
  logIn, getRandomToken,
  createAccount, createAccountViaSchema,
  editAccount };