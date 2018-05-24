module.exports = app => {
  const User = require('../schemas/User');
  const Group = require('../schemas/Group');
  // const HomeworkTag = require('../schemas/HomeworkTag');
  const {
    authenticationMiddleware,
    dataNormalizationMiddleware,
    handleUnauthorized,
    handleError,
    handleForbidden,
    checkPermissionMiddleware: checkPermissionMiddle } = require('../../utils');
  const { regexps } = require('../../config.js');

  function getGroup (req, res) {
    return Group.findById(req.params.groupId);
  }

  function checkIfGroupExistsMiddleware () {
    return async (req, res, next) => {
      req._group = req._group || await getGroup(req, res);

      if (!req._group) {
        return res
          .status(404)
          .json({ success: false, error: 'groupNotFound' });
      }

      next();
    };
  }

  const checkPermissionMiddleware = role => checkPermissionMiddle(role, getGroup);

  app.get(
    '/api/v1/groups',
    authenticationMiddleware(),
    async (req, res) => {
      const groups = await Group.find({
        members: { $elemMatch: { id: req.user._id } }
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
      const group = await Group.findOne({ joinName: req.params.joinName });

      if (!group) {
        return res
          .status(404)
          .json({ success: false, error: 'groupNotFound' });
      }

      group.addMember(req.user._id);

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
    '/api/v1/group/:groupId/makeMemberAdmin',
    authenticationMiddleware(),
    dataNormalizationMiddleware(),
    checkIfGroupExistsMiddleware(),
    checkPermissionMiddleware('admin'),
    async (req, res) => {
      const group = req._group || await Group.findById(req.params.groupId);

      const member = group.members.find(member => (
        member.id.equals(req.body.memberId)
      ));

      if (member) {
        member.addAdmin();
      } else {
        return res
          .status(404)
          .json({ success: false, error: 'memberDoesntExist' });
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
    checkIfGroupExistsMiddleware(),
    checkPermissionMiddleware('admin'),
    async (req, res) => {
      const group = req._group || await Group.findById(req.params.groupId);

      const member = group.members.find(member => (
        member.id.equals(req.body.memberId)
      ));

      if (!member) {
        return res
          .status(404)
          .json({ success: false, error: 'memberDoesntExist' });
      }
      
      if (member.id.equals(req.user._id)) {
        return res
          .status(400)
          .json({ success: false, error: 'cannotRemoveAdminFromYourself' });
      }

      member.removeAdmin();

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
    checkIfGroupExistsMiddleware(),
    checkPermissionMiddleware('admin'),
    async (req, res) => {
      const { name, joinName } = req.body;
      
      let group;

      try {
        group = await Group.findOneAndUpdate(
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
    checkIfGroupExistsMiddleware(),
    async (req, res) => {
      const group = req._group || await Group.findOne({ joinName: req.params.joinName });

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