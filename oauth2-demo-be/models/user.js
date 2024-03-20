const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userid: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  picture: { type: String },
  introduction: { type: String },
});

module.exports = mongoose.model('User', userSchema);
