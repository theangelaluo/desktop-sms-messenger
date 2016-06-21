var mongoose = require('mongoose');
mongoose.connect(require('./connect'));

var schema = mongoose.Schema({
  contact: String,
  body: String,
  subject: String,
  status: Number,
  timestamp: Date
});

module.exports = mongoose.model('Message', schema);
