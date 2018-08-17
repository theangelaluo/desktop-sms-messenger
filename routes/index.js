var express = require('express');
var router = express.Router();
var models = require('../models/models');
var Contact = models.Contact;
var User = models.User;
var Message = models.Message;
var moment = require('moment');

var accountSid = process.env.TWILIO_SID; // Your Account SID from www.twilio.com/console
var authToken = process.env.TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console
var fromNumber = process.env.MY_TWILIO_NUMBER; // Your custom Twilio number
var twilio = require('twilio');
var client = new twilio(accountSid, authToken);

router.post('/messages/receive', function(req, res, next) {
  User.findOne({phone: req.body.To}, function(err, user) {
    Contact.findOne({phone: req.body.From}, function(err, contact) {
      if(err) return next(err);
      var message = new Message({
        created: new Date(),
        content: req.body.Body,
        user: user.id,
        contact: contact.id,
        from: req.body.From,
        status: 'Received',
        channel: 'SMS'
      });
      message.save(function(err) {
        if(err) return next(err);
        res.send("Thanks Twilio <3");
      });
    })
  });
});

/* GET home page. */
router.get('/contacts', function(req, res, next) {
  User.findById(req.user, function(err, user) {
    Contact.find({owner: req.user.id}, function(error, contacts) {
      if (err) {
        console.log(err);
      } else {
        res.render('contacts', {
          contacts: contacts,
          user: user
        })
      }
    })
  })
});

router.get('/contacts/new', function(req, res) {
  res.render('editContact');
})

router.get('/contacts/:id', function(req, res) {
  Contact.findById(req.params.id, function(err, contact) {
    res.render('editContact', {
      contact: contact
    })
  })
})

router.post('/contacts/new', function(req, res) {
  var contact = new Contact({
    owner: req.user.id,
    name: req.body.name,
    phone: req.body. phone
  });
  contact.save(function(err) {
    if (err) {
      console.log(err);
    }
  })
  res.redirect('/contacts');
})

router.post('/contacts/:id', function(req, res, next) {
  Contact.findById(req.params.id, function(err, contact) {
    if (err) return next(err);
    contact.name = req.body.name;
    contact.phone = req.body.phone;
    contact.owner = req.user.id;
    contact.save(function(err) {
      if (err) return next(err);
      res.redirect('/contacts');
    });
  });
});

router.get('/messages', function(req, res) {
  Message
  .find({user: req.user.id})
  .populate({
    path: 'contact',
    model: 'Contact'
  })
  .exec((err, messages) => {
    if (err) return next(err);
    messages.map((msg => (msg.formattedDate = moment(msg.created).format("dddd, MMMM Do YYYY, h:mm:ss a"))));
    res.render('messages', {
      messages: messages
    });
  })
})

router.get('/messages/:id', function(req, res, next) {
  Contact.findById(req.params.id, function(err, contact) {
    if (err) return next(err);
    Message
    .find({user: req.user.id, contact: req.params.id})
    .populate({
      path: 'contact',
      model: 'Contact'
    })
    .exec((err, messages) => {
      if (err) return next(err);
      messages.map((msg => (msg.formattedDate = moment(msg.created).format("dddd, MMMM Do YYYY, h:mm:ss a"))));
      res.render('messages', {
        messages: messages,
        contact: contact
      });
    });
  });
});

router.get('/messages/send/:id', function(req, res) {
  Contact.findById(req.params.id, function(err, contact) {
    if (err) return next(err);
    res.render('newMessage', {
      contact: contact
    })
  })
});

router.post('/messages/send/:id', function(req, res) {
  Contact.findById(req.params.id, function(err, contact) {
    if (err) console.log(err);

    var message = new Message({
      created: new Date(),
      content: req.body.message,
      user: req.user._id,
      contact: contact._id,
      channel: 'SMS',
      status: 'Sent',
      from: ''
    });

    client.messages.create({
      to: "+1" + contact.phone,
      from: process.env.MY_TWILIO_NUMBER,
      body: req.body.message
    }, function(err, msg) {
      if (err) console.log(err);
      message.save(function(err) {
        if(err) console.log(err);
        res.redirect('/messages/' + req.params.id)
      });
      })
  });
})

module.exports = router;
