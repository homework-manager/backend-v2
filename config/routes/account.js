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
        .json({ success: true, user: req.user.getPrivateData() });
    }
  );

  app.post(
    '/api/v1/account',
    dataNormalizationMiddleware(),
    async (req, res) => {
      const newUser = new User(req.body);
    
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
      
      try {
        const profile = await Group.findOneAndUpdate(
          { _id: req.user._id },
          { username, fullname, email },
          { new: true, runValidators: true, context: 'query' }
        ).getPrivateData();
      } catch (error) {
        return handleError(error, req, res);
      }

      res
        .status(200)
        .json({ success: true, profile });
    }
  );

};