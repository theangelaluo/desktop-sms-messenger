var mongoose = require('mongoose');

var schema = mongoose.Schema({
  name: String,
  email: String,
  phone: String
});

module.exports = mongoose.model('Contact', schema);
