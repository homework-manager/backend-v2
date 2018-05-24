module.exports = app => {
  const User = require('../schemas/User');
  const Group = require('../schemas/Group');
  const Homework = require('../schemas/Homework');
  const HomeworkTag = require('../schemas/HomeworkTag');
  const {
    authenticationMiddleware,
    dataNormalizationMiddleware,
    handleError,
    handleForbidden,
    checkPermissionMiddleware: checkPermissionMiddle,
    groupExistsMiddleware: groupExistsMiddle } = require('../../utils');
  const { regexps } = require('../../config.js');

  const mongoose = require('mongoose');

  async function getHomeworkTag (req, res) {
    const homeworkTagId =
      req.body._id
        ? req.body._id
        : req.params.homeworkTagId;
    
    if (!homeworkTagId) return undefined;

    if (!mongoose.Types.ObjectId.isValid(homeworkTagId)) {
      res
        .status(404)
        .json({ success: false, error: 'homeworkTagNotFound' });
      return false;
    }

    const homeworkTag = await HomeworkTag.findById(homeworkTagId);

    if (!homeworkTag) {
      res
        .status(404)
        .json({ success: false, error: 'homeworkTagNotFound' });
      return false;
    }

    return homeworkTag;
  }

  async function getGroup (req, res) {
    let groupId =
      req.params.groupId
        ? req.params.groupId
        : req.body.groupId;

    const homeworkTag = await getHomeworkTag(req, res);

    if (homeworkTag === false) return false;
    if (homeworkTag) groupId = homeworkTag.groupId;

    const group = await Group.findById(groupId);

    if (!group) {
      res
        .status(400)
        .json({ success: false, error: 'groupNotFound' });
      return false;
    }

    return group;
  }

  const groupExistsMiddleware = () => groupExistsMiddle(getGroup);

  const checkPermissionMiddleware = role => checkPermissionMiddle(role, getGroup);

  function getValidHomeworkTagFields (body) {
    return {
      name: body.name,
      color: body.color
    };
  }

  app.get(
    '/api/v1/homeworkTags',
    authenticationMiddleware(),
    async (req, res) => {
      const groups = await Group.find({
        members: { $elemMatch: { id: req.user._id } }
      });

      const homeworkTags = await HomeworkTag.find({
        groupId: groups.map(group => group._id)
      });

      res
        .status(200)
        .json({ success: true, homeworkTags });
    }
  );

  app.get(
    '/api/v1/group/:groupId/homeworkTags',
    authenticationMiddleware(),
    groupExistsMiddleware(),
    checkPermissionMiddleware('member'),
    async (req, res) => {
      const homeworkTags = await HomeworkTag.find({ groupId: req.params.groupId });

      res
        .status(200)
        .json({ success: true, homeworkTags });
    }
  );

  app.put(
    '/api/v1/homeworkTag',
    authenticationMiddleware(),
    dataNormalizationMiddleware(),
    groupExistsMiddleware(),
    checkPermissionMiddleware('admin'),
    async (req, res) => {
      const newHomeworkTag = new HomeworkTag({
        ...getValidHomeworkTagFields(req.body),
        groupId: req.body.groupId,
        createdBy: req.user._id
      });

      try {
        await newHomeworkTag.save();
      } catch (error) {
        return handleError(error, req, res);
      }

      res
        .status(200)
        .json({ success: true, homeworkTag: newHomeworkTag });
    }
  );

  app.patch(
    '/api/v1/homeworkTag/:homeworkTagId',
    authenticationMiddleware(),
    dataNormalizationMiddleware(),
    groupExistsMiddleware(),
    checkPermissionMiddleware('admin'),
    async (req, res) => {
      let homeworkTag;

      try {
        homeworkTag = await getHomeworkTag(req, res);

        if (homeworkTag === false) return;

        const homeworkTagData = {
          ...homeworkTag._doc, ...getValidHomeworkTagFields(req.body)
        };
        
        delete homeworkTagData._id;

        homeworkTag = await HomeworkTag.findByIdAndUpdate(
          req.params.homeworkTagId,
          homeworkTagData,
          { new: true, runValidators: true, context: 'query' }
        );
      } catch (error) {
        return handleError(error, req, res);
      }

      res
        .status(200)
        .json({ success: true, homeworkTag });
    }
  );

  app.delete(
    '/api/v1/homeworkTag/:homeworkTagId',
    authenticationMiddleware(),
    dataNormalizationMiddleware(),
    groupExistsMiddleware(),
    checkPermissionMiddleware('admin'),
    async (req, res) => {
      await HomeworkTag.remove({ _id: req.params.homeworkTagId });

      res
        .status(200)
        .json({ success: true });
    }
  );
};