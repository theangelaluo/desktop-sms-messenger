var mongoose = require('mongoose');
var connect = require('./connect') || process.env.MONGODB_URI;
mongoose.connect(connect);

// Step 1: Create and edit contacts
// Remember: schemas are like your blueprint, and models
// are like your building!
var contactSchema = mongoose.Schema({
    name: String,
    phone: String
});

var userSchema = mongoose.Schema({
  username: String,
  password: String
});


module.exports = {
    Contact: mongoose.model('Contact', contactSchema),
    User: mongoose.model('User', userSchema)
};
