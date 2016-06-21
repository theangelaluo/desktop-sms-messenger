var express = require('express');
var accountSid = process.env.ACCOUNT_SID;
var authToken = process.env.AUTH_TOKEN;
var fromPhone = process.env.FROM_PHONE;
var twilio = require('twilio')(accountSid, authToken);
var router = express.Router();
var models = require('../models/models');
var _ = require('underscore');
var Contact = models.Contact;
var Message = models.Message;

router.use(function(req, res, next){
  console.log(req.user)
  if (!req.user) {
    res.redirect('/login');
  } else {
    return next();
  }
});

/* GET home page. */
router.get('/contacts', function(req, res, next) {
  // Load all contacts (that this user has permission to view).
  Contact.find(function(err, contacts) {
    if (err) return next(err);
    res.render('contacts', {
      contacts: contacts 
    });
  });
});

router.get('/contacts/new', function(req, res, next) {
  res.render('editContact');
});

router.get('/contacts/:id', function(req, res) {
  Contact.findById(req.params.id, function(err, contact) {
    if (err) return next(err);
    res.render('editContact', {
      contact: contact
    });
  });
});

router.post('/contacts/new', function(req, res, next) {
  var contact = new Contact({
    name: req.body.name,
    phone: req.body.phone
  });
  contact.save(function(err) {
    if (err) return next(err);
    res.redirect('/contacts');
  })
});

router.post('/contacts/:id', function(req, res, next) {
  Contact.findById(req.params.id, function(err, contact) {
    if (err) return next(err);
    contact.name = req.body.name;
    contact.phone = req.body.phone;
    contact.save(function(err) {
      if (err) return next(err);
      res.redirect('/contacts');
    });
  });
});

router.get('/messages', function(req, res, next) {
  Message.find({user: req.user._id}, function(err, messages) {
    if (err) return next(err);
    // var messagesGroupedByTo = _.groupBy(messages, function(message) {
    //   return message.to;
    // });
    res.render('messages', {
      messages: messages
      // messages: _.mapObject(messagesGroupedByTo, function(messageArray) {
      //   return messageArray[0];
      // })
    });
  });
});

router.get('/messages/:id', function(req, res, next) {
  Contact.findById(req.params.id, function(err, contact) {
    if (err) return next(err);
    Message.find({user: req.user._id, to: req.params.id}, function(err, messages) {
      if (err) return next(err);
      res.render('messages', {
        messages: messages,
        contact: contact
      });
    });
  });

});

router.get('/messages/send/:id', function(req, res, next) {
  Contact.findById(req.params.id, function(err, user) {
    res.render('newMessage', {
      contact: user
    });
  });
});

router.post('/messages/send/:id', function(req, res, next) {
  Contact.findById(req.params.id, function(err, user) {
    if (err) return next(err);
    twilio.messages.create({
      to: "+1" + user.phone,
      from: fromPhone,
      body: req.body.message
    }, function(err, message) {
      if (err) return next(err);
      var message = new Message({
        created: new Date(),
        content: req.body.message,
        user: req.user._id,
        to: user._id
      });
      message.save(function(err) {
        if(err) return next(err);
        res.redirect('/messages/' + req.params.id)
      });
    })
  });
});

router.post('/messages/receive', function(req, res, next) {
  Contact.find({phone: req.body.From.substring(2)}, function(err, user) {
    var message = new Message({
      created: new Date(),
      content: req.body.Body,
      user: req.user._id,
      to: req.user._id
    });
    message.save(function(err) {
      if(err) return next(err);
      res.send("Thanks Twilio <3");
    });
  });
});

module.exports = router;