const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const uniqueValidator = require('mongoose-unique-validator');

const { regexps } = require('../../config');

const homeworkTagSchema = mongoose.Schema({
  name: { type: String, required: true },
  groupId: { type: ObjectId, required: true }
}, { timestamps: true });

homeworkTagSchema.path('name').validate(value => (!value) || (value.length <= 75));

homeworkTagSchema.plugin(uniqueValidator);

module.exports = mongoose.model('HomeworkTag', homeworkTagSchema);