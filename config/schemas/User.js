const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');

const { validate } = require('../../utils');
const { regexps } = require('../../config');

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true, validate: regexps.username },
  fullname: { type: String, validate: regexps.fullname },
  passwordHash: { type: String },
  email: { type: String, required: true, unique: true, validate: regexps.email }
}, { timestamps: true });

userSchema.methods.getPublicData = function () {
  return {
    _id: this._id,
    username: this.username,
    fullname: this.fullname
  };
};

userSchema.methods.getPrivateData = function () {
  return {
    _id: this._id,
    username: this.username,
    fullname: this.fullname,
    email: this.email
  };
};

const { createHash } = require('../../utils');

userSchema.methods.setPassword = function (password) {
  if (password.length < 6) {
    throw new Error('invalid');
  }
  this.passwordHash = createHash(password);
};

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);