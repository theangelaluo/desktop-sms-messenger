var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

// Create a connect.js inside the models/ directory that
// exports your MongoDB URI!
var connect = process.env.MONGODB_URI || require('./connect');

// If you're getting an error here, it's probably because
// your connect string is not defined or incorrect.
mongoose.connect(connect);

// Step 1: Write your schemas here!
// Remember: schemas are like your blueprint, and models
// are like your building!
var contactSchema = mongoose.Schema({
  name: String,
  phone: String,
  owner: String
});

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  phone: String,
  facebookId: String,
  facebookToken: String,
  pictureURL: String,
  friends: Object,
  twitterId: String,
  twitterToken: String,
  twitterTokenSecret: String,
  followers: Object
});
userSchema.plugin(findOrCreate);

var messageSchema = mongoose.Schema({
  created: Date,
  content: String,
  user: String,
  contact: String,
  channel: String,
  status: String,
  from: String
});

// Step 2: Create all of your models here, as properties.
var models = {
  Contact: mongoose.model('Contact', contactSchema),
  User: mongoose.model('User', userSchema),
  Message: mongoose.model('Message', messageSchema)
};

// Step 3: Export your models object
module.exports = models;
