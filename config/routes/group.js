module.exports = app => {
  const Group = require('../schemas/Group');
  const {
    authenticationMiddleware,
    dataNormalizationMiddleware,
    handleError } = require('../../utils');
  const { regexps } = require('../../config.js');

  app.get(
    '/api/v1/groups',
    authenticationMiddleware(),
    async (req, res) => {
      const groups = await Group.find({
        members: {$elemMatch: {id: req.user._id}}
      });

      res
        .status(200)
        .json({ success: true, groups });
    }
  );

  app.post(
    '/api/v1/group',
    authenticationMiddleware(),
    dataNormalizationMiddleware(),
    async (req, res) => {
      const newGroup = new Group(req.body);

      newGroup.addMember(req.user._id, [{ admin: true }]);

      try {
        await newGroup.save();
      } catch (error) {
        return handleError(error, req, res);
      }

      res
        .status(200)
        .json({ success: true, group: newGroup });
    }
  );

  app.patch(
    '/api/v1/group/:groupId',
    authenticationMiddleware(),
    dataNormalizationMiddleware(),
    async (req, res) => {
      const { name, joinName } = req.body;
      
      try {
        const group = await Group.findOneAndUpdate(
          { _id: req.params.groupId },
          { name, joinName },
          { new: true, runValidators: true, context: 'query' }
        );
      } catch (error) {
        return handleError(error, req, res);
      }

      res
        .status(200)
        .json({ success: true, group });
    }
  );

};