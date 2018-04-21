const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const uniqueValidator = require('mongoose-unique-validator');

const { regexps } = require('../../config');

const homeworkSchema = mongoose.Schema({
  title: { type: String, required: true, validate: regexps.homework.title },
  description: { type: String, validate: regexps.homework.description },
  groupId: { type: ObjectId, required: true },
  createdBy: { type: ObjectId, required: true },
  doneBy: { type: [ObjectId], default: [], required: true }
}, { timestamps: true });

homeworkSchema.methods.markUserAsDone = function (userId) {
  const userAlreadyDone = this.doneBy.find(id => id.equals(userId));

  if (!userAlreadyDone) {
    this.doneBy.push(userId);
  }
};

homeworkSchema.methods.markUserAsNotDone = function (userId) {
  const userDone = this.doneBy.findIndex(id => id.equals(userId));

  // index can be 0, have to check for undefined only
  if (userDone !== undefined) {
    this.doneBy.splice(userDone, 1);
  }
};

homeworkSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Homework', homeworkSchema);