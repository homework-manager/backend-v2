module.exports = app => {
  const User = require('../schemas/User');
  const Group = require('../schemas/Group');
  const Homework = require('../schemas/Homework');
  const {
    authenticationMiddleware,
    dataNormalizationMiddleware,
    handleError,
    handleForbidden } = require('../../utils');
  const { regexps } = require('../../config.js');

  async function groupE

  function groupExistsMiddleware (groupIdField) {
    return async (req, res, next) => {
      req.group = req.group || await Group.findOne({ _id: req.body[groupIdField] });

      if (!req.group) {
        return res
          .status(400)
          .json({ success: false, error: 'groupNotFound' });
      }

      next();
    }
  }

  function checkPermissionMiddleware (role) {
    return async (req, res, next) => {
      req.group = req.group || await Group.findOne({ _id: req.body[groupIdField] });

      let hasPermission

      switch (role) {
        case 'member':
          hasPermission = req.group.userIsMember(req.user._id);
          break;
        case 'admin':
          hasPermission = req.group.userIsAdmin(req.user._id);
          break;
      }

      if (!hasPermission) {
        return handleForbidden(req, res);
      }

      next();
    }
  }

  function getValidHomeworkFields (body) {
    return {
      title: body.title,
      description: body.description
    };
  }

  // Returns all the homeworks from the groups that the user is in
  app.get(
    '/api/v1/homeworks',
    authenticationMiddleware(),
    async (req, res) => {
      const groups = await Group.find({
        members: {$elemMatch: {id: req.user._id}}
      });

      const homeworks = await Homework.find({
        groupId: groups.map(group => group._id)
      });

      res
        .status(200)
        .json({ success: true, homeworks });
    }
  );

  // Returns all homeworks from requested group
  // [if user is member]
  app.get(
    '/api/v1/group/:groupId/homeworks',
    authenticationMiddleware(),
    groupExistsMiddleware('groupId'),
    checkPermissionMiddleware('member'),
    async (req, res) => {
      const homeworks = await Homework.find({ groupId: req.params.groupId });

      res
        .status(200)
        .json({ success: true, homeworks });
    }
  );

  // Creates a homework in a group [if the user is admin]
  app.put(
    '/api/v1/homework',
    authenticationMiddleware(),
    dataNormalizationMiddleware(),
    groupExistsMiddleware('groupId'),
    checkPermissionMiddleware('admin'),
    async (req, res) => {
      const newHomework = new Homework({
        ...getValidHomeworkFields(req.body),
        groupId: req.body.groupId,
        createdBy: req.user._id
      });

      try {
        await newGroup.save();
      } catch (error) {
        return handleError(error, req, res);
      }

      res
        .status(200)
        .json({ success: true, homework: newHomework });
    }
  );

  // Edits a homework [if the user is admin in the group]
  app.patch(
    '/api/v1/homework/:homeworkId',
    authenticationMiddleware(),
    dataNormalizationMiddleware(),
    groupExistsMiddleware('groupId'),
    checkPermissionMiddleware('admin'),
    async (req, res) => {
      try {
        let homework = await Homework.findOne({
          _id: req.params.homeworkId
        });

        homework = await Homework.findOneAndUpdate(
          { _id: req.params.homeworkId },
          { ...homework, ...getValidHomeworkFields(req.body) },
          { new: true, runValidators: true, context: 'query' }
        );
      } catch (error) {
        return handleError(error, req, res);
      }

      res
        .status(200)
        .json({ success: true, homework });
    }
  );

};