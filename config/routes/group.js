module.exports = app => {
  const User = require('../schemas/User');
  const Group = require('../schemas/Group');
  const {
    authenticationMiddleware,
    dataNormalizationMiddleware,
    handleUnauthorized,
    handleError,
    handleForbidden } = require('../../utils');
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
    },
    handleUnauthorized()
  );

  app.post(
    '/api/v1/group',
    authenticationMiddleware(),
    dataNormalizationMiddleware(),
    async (req, res) => {
      const newGroup = new Group({
        name: req.body.name,
        joinName: req.body.joinName
      });

      newGroup.addMember(req.user._id, [{ admin: true }]);

      try {
        await newGroup.save();
      } catch (error) {
        return handleError(error, req, res);
      }

      res
        .status(200)
        .json({ success: true, group: newGroup });
    },
    handleUnauthorized()
  );

  app.post(
    '/api/v1/group/join/:joinName',
    authenticationMiddleware(),
    dataNormalizationMiddleware(),
    async (req, res) => {
      const group = Group.findOne({ joinName: req.params.joinName });

      group.addMember(req.user._id);

      try {
        await group.save();
      } catch (error) {
        return handleError(error, req, res);
      }

      res
        .status(200)
        .json({ success: true, group: newGroup });
    },
    handleUnauthorized()
  );

  app.post(
    '/api/v1/group/:groupId/makeMemberAdmin',
    authenticationMiddleware(),
    dataNormalizationMiddleware(),
    async (req, res) => {
      const group = Group.findOne({ _id: req.params.groupId });

      if (group.userIsAdmin(req.user._id)) {
        const member = group.members.find(member => (
          req.body.memberId === member.id
        ));

        if (member) {
          member.addAdmin();
        } else {
          return res
            .status(404)
            .json({ success: false, error: 'memberDoesntExist' });
        }
      } else {
        return handleForbidden(req, res);
      }

      try {
        await group.save();
      } catch (error) {
        return handleError(error, req, res);
      }

      res
        .status(200)
        .json({ success: true, group });
    },
    handleUnauthorized()
  );

  app.post(
    '/api/v1/group/:groupId/removeAdminFromMember',
    authenticationMiddleware(),
    dataNormalizationMiddleware(),
    async (req, res) => {
      const group = Group.findOne({ _id: req.params.groupId });

      if (group.userIsAdmin(req.user._id)) {
        const member = group.members.find(member => (
          req.body.memberId === member.id
        ));

        if (member) {
          member.removeAdmin();
        } else {
          return res
            .status(404)
            .json({ success: false, error: 'memberDoesntExist' });
        }
      }

      try {
        await group.save();
      } catch (error) {
        return handleError(error, req, res);
      }

      res
        .status(200)
        .json({ success: true, group });
    },
    handleUnauthorized()
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
    },
    handleUnauthorized()
  );

  app.get(
    '/api/v1/group/:groupId/members',
    authenticationMiddleware(),
    async (req, res) => {
      const group = await Group.findOne({ _id: req.params.groupId });

      const members = await User.find({
        _id: group.members.map(member => member.id)
      });

      const membersInfo = members.map(member => member.getPublicData());

      res
        .status(200)
        .json({ success: true, members: membersInfo });
    },
    handleUnauthorized()
  );

};