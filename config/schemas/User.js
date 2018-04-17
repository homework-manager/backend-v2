const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true },
  fullname: String,
  passwordHash: { type: String },
  email: { type: String, required: true }
});

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
  this.passwordHash = createHash(password);
};

module.exports = mongoose.model('User', userSchema);