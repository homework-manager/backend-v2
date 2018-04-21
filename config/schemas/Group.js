const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const uniqueValidator = require('mongoose-unique-validator');

const { regexps } = require('../../config');

const User = require('./User');

let groupMemberSchema = mongoose.Schema({
  id: { type: ObjectId, required: true },
  roles: { type: Array, default: [], required: true }
}, { _id: false });

groupMemberSchema.methods.getUser = async function () {
  return await User.findOne({ _id: this.id });
};

groupMemberSchema.methods.addAdmin = function () {
  this.roles.push({ admin: true });
};

groupMemberSchema.methods.removeAdmin = function () {
  const index = this.roles.findIndex(role => role.admin);

  if (index !== undefined) {
    this.roles.splice(index, 1);
  }
};

let groupSchema = mongoose.Schema({
  name: { type: String, required: true, validate: regexps.group.name },
  joinName: { type: String, required: true, unique: true, validate: regexps.group.joinName },
  members: [groupMemberSchema]
});

groupSchema.methods.addMember = function (memberId, roles) {
  const member = this.members.find(
    obj => memberId.equals(obj.id)
  );

  if (member) { // check if member already exists
    return member;
  }

  const newMember = {
    id: memberId,
    roles
  };

  this.members.push(newMember);

  return newMember;
};

groupSchema.methods.userIsMember = function (memberId) {
  const isMember = this.members.some(
    member => (
      member.id.equals(memberId)
    )
  );

  return isMember;
};

groupSchema.methods.userIsAdmin = function (memberId) {
  const isAdmin = this.members.some(
    member => (
      member.id.equals(memberId) &&
      member.roles.some(
        role => role.admin
      )
    )
  );

  return isAdmin;
};

groupSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Group', groupSchema);
