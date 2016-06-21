// Create a user model for passport authentication here.

var mongoose = require('mongoose');
mongoose.connect(require('./connect'));

var schema = mongoose.Schema({
  username: String,
  password: String
});

module.exports = mongoose.model('User', schema);
