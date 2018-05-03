module.exports = app => {
  const User = require('../schemas/User');
  const {
    authenticationMiddleware,
    dataNormalizationMiddleware,
    handleError } = require('../../utils');
  const { regexps } = require('../../config.js');

  app.get(
    '/api/v1/account',
    authenticationMiddleware(),
    (req, res) => {
      res
        .status(200)
        .json({ success: true, account: req.user.getPrivateData() });
    }
  );

  app.post(
    '/api/v1/account',
    dataNormalizationMiddleware(),
    async (req, res) => {
      const newUser = new User(req.body);

      if (req.body.password.length < 6) {
        return res
          .status(400)
          .json({ success: false, error: 'passwordIsInvalid' });
      }

      newUser.setPassword(req.body.password);

      try {
        await newUser.save();
      } catch (error) {
        return handleError(error, req, res);
      }

      res
        .status(200)
        .json({ success: true });
    }
  );

  app.patch(
    '/api/v1/account',
    authenticationMiddleware(),
    dataNormalizationMiddleware(),
    async (req, res) => {
      const { username, fullname, email } = req.body;
      
      let profile

      try {
        await User.updateOne(
          { _id: req.user._id },
          { username, fullname, email },
          { new: true, runValidators: true, context: 'query' }
        );

        profile = (await User
          .findOne({ _id: req.user._id }))
          .getPrivateData();

        console.log(profile)


      } catch (error) {
        // console.log(error)
        return handleError(error, req, res);
      }

      res
        .status(200)
        .json({ success: true, profile });
    }
  );

};