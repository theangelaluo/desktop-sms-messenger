var express = require('express');
var router = express.Router();
var Contact = require('../models/contact');

/* GET home page. */
router.get('/', function(req, res, next) {
  // Load all contacts (that this user has permission to view).
  Contact.find(function(err, contacts) {
    if (err) {
      res.status(500).send("Error fetching contacts");
    }
    else {
      res.render('index', { contacts: contacts });
    }
  });
});

module.exports = router;
