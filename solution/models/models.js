var mongoose = require('mongoose');
var connect = process.env.MONGODB_URI || require('./connect');
mongoose.connect(connect);

// Step 1: Create and edit contacts
// Remember: schemas are like your blueprint, and models
// are like your building!
var contactSchema = mongoose.Schema({
  name: String,
  phone: String,
  owner: String
});

var userSchema = mongoose.Schema({
  username: String,
  password: String
});

var messageSchema = mongoose.Schema({
  created: Date,
  content: String,
  user: String,
  to: String
});

module.exports = {
    Contact: mongoose.model('Contact', contactSchema),
    User: mongoose.model('User', userSchema),
    Message: mongoose.model('Message', messageSchema)
};
