var mongoose = require('mongoose');
mongoose.connect(require('./connect'));

var schema = mongoose.Schema({
  name: String,
  email: String,
  phone: String
});

module.exports = mongoose.model('Contact', schema);
