var express = require('express');
var router = express.Router();
var models = require('../models/models');
var User = models.User;

module.exports = function(passport) {
  // Add Passport-related auth routes here, to the router!
  // YOUR CODE HERE
  router.get('/', function(req, res) {
    if (req.user) {
      res.redirect('/contacts');
    } else {
      res.redirect('/login');
    }
  })

  router.get('/signup', function(req, res) {
    res.render('signup')
  });

  router.post('/signup', function(req, res) {
    if (req.body.username && req.body.password && (req.body.password === req.body.passwordRepeat)) {
      var user = new User({
        username: req.body.username,
        password: req.body.password
      });
      user.save(function(err) {
        if (err) {
          console.log("couldn't save user");
        }
      });
      res.redirect('/login');
    } else {
      console.log('Could not signup');
    }
  });

  router.get('/login', function(req, res) {
    res.render('login');
  });

  router.post('/login', passport.authenticate('local', {
    successRedirect: '/contacts',
    failureRedirect: '/login'
  }));

  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  })

  return router;
}
