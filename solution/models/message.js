var mongoose = require('mongoose');

var schema = mongoose.Schema({
  contact: String,
  body: String,
  subject: String,
  status: Number,
  timestamp: Date
});

module.exports = mongoose.model('Message', schema);
