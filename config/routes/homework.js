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

  async function getHomework (req, res) {
    const homeworkId =
      req.body._id
        ? req.body._id
        : req.params.homeworkId;
    
    if (!homeworkId) return undefined;

    const homework = await Homework.findById(homeworkId);

    if (!homework) {
      res
        .status(404)
        .json({ success: false, error: 'homeworkNotFound' });
      return false;
    }

    return homework;
  }

  async function getGroup (req, res) {
    let groupId =
      req.params.groupId
        ? req.params.groupId
        : req.body.groupId;

    const homework = await getHomework(req, res);

    if (homework === false) return false;
    if (homework) groupId = homework.groupId;

    const group = await Group.findById(groupId);

    if (!group) {
      res
        .status(400)
        .json({ success: false, error: 'groupNotFound' });
      return false;
    }

    return group;
  }

  function groupExistsMiddleware () {
    return async (req, res, next) => {
      const group = await getGroup(req, res);

      if (!group) return;

      req.__group = req.__group || group;

      next();
    }
  }

  function checkPermissionMiddleware (role) {
    return async (req, res, next) => {
      const group = await getGroup(req, res);

      if (!group) return;

      req.__group = req.__group || group;

      let hasPermission;

      switch (role) {
        case 'member':
          hasPermission = req.__group.userIsMember(req.user._id);
          break;
        case 'admin':
          hasPermission = req.__group.userIsAdmin(req.user._id);
          break;
      }

      if (!hasPermission) {
        return handleForbidden()(req, res);
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
        members: { $elemMatch: { id: req.user._id } }
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
    groupExistsMiddleware(),
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
    groupExistsMiddleware(),
    checkPermissionMiddleware('admin'),
    async (req, res) => {
      const newHomework = new Homework({
        ...getValidHomeworkFields(req.body),
        groupId: req.body.groupId,
        createdBy: req.user._id
      });

      try {
        await newHomework.save();
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
    groupExistsMiddleware(),
    checkPermissionMiddleware('admin'),
    async (req, res) => {
      let homework;

      try {
        homework = await Homework.findById(req.params.homeworkId);

        if (!homework) {
          return res
            .status(404)
            .json({ success: false, error: 'homeworkNotFound' });
        }

        const homeworkData = {
          ...homework._doc, ...getValidHomeworkFields(req.body)
        };
        
        delete homeworkData._id;

        homework = await Homework.findByIdAndUpdate(
          req.params.homeworkId,
          homeworkData,
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

  app.delete(
    '/api/v1/homework/:homeworkId',
    authenticationMiddleware(),
    dataNormalizationMiddleware(),
    groupExistsMiddleware(),
    checkPermissionMiddleware('admin'),
    async (req, res) => {
      await Homework.remove({ _id: req.params.homeworkId });

      res
        .status(200)
        .json({ success: true });
    }
  );

  app.post(
    '/api/v1/homework/:homeworkId/done',
    authenticationMiddleware(),
    dataNormalizationMiddleware(),
    groupExistsMiddleware(),
    checkPermissionMiddleware('member'),
    async (req, res) => {
      const homework = await getHomework(req, res);

      if (!homework) return;

      homework.markUserAsDone(req.user._id);

      await homework.save();

      res
        .status(200)
        .json({ success: true, homework });
    }
  );

  app.post(
    '/api/v1/homework/:homeworkId/notDone',
    authenticationMiddleware(),
    dataNormalizationMiddleware(),
    groupExistsMiddleware(),
    checkPermissionMiddleware('member'),
    async (req, res) => {
      const homework = await getHomework(req, res);

      if (!homework) return;

      homework.markUserAsNotDone(req.user._id);

      await homework.save();

      res
        .status(200)
        .json({ success: true, homework });
    }
  );

};