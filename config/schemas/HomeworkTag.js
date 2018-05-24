const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const uniqueValidator = require('mongoose-unique-validator');

const { regexps } = require('../../config');

const homeworkTagSchema = mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, required: true, default: 'black' },
  groupId: { type: ObjectId, ref: 'Group', required: true },
  createdBy: { type: ObjectId, ref: 'User', required: true }
}, { timestamps: true });

homeworkTagSchema.path('color').validate(value => (!value) || (value.length <= 75));
homeworkTagSchema.path('name').validate(value => (!value) || (value.length <= 75));

homeworkTagSchema.plugin(uniqueValidator);

module.exports = mongoose.model('HomeworkTag', homeworkTagSchema);