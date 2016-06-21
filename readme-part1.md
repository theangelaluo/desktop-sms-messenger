# Pair programming exercise: Double Message Part 1

## Contents

## Goal

In this exercise, you're going to build a basic personal relationship manager
(PRM) app called Double Message. The app will allow you to see and manage
conversations with a list of people via multiple channels, such as email and
SMS, from a single view. Here are the requirements:

- The app should be multi-user and should be hosted on Heroku. Users log in
  using a username and password, or using Facebook.
- Upon login, the user sees a list of contacts, with the number of total
  messages exchanged, and the number of new messages, from each contact.
- There's a button on this main view that allows the user to create a new
  contact, entering basic information such as contact name and contact
  information (email, phone number for SMS).
- When the user taps on a contact, they see a single flow of all messages
  exchanged with that contact via any channel. Each individual message is marked
  with a channel, such as SMS or email.
- On this view, the user can also view and update the contact's contact
  information (email and phone number for SMS).
- On this view, the user can also compose a new message to the contact, and to
  select the channel that the message should be sent on. Once it's been sent, it
  should appear at the end of the flow of messages with this contact.
- The user can indicate that a new outgoing message should be delayed, to be
  delivered at a specific time in the future.

This project will take two days to finish. We'll start with the basic
functionality and SMS messaging today, and then add Facebook authentication
using OAuth and a few other features tomorrow in [Part 2](./readme-part2.md).

## Getting started

Work with the scaffolding in the `skeleton` folder. Here are the other things
you'll need to get started:

- Node, with npm. Make sure to run `npm install` in this folder!
- Mongo: an mLab account with one live, running MongoDB deployment
- Heroku: a Heroku account, and the Heroku toolbelt installed locally, logged in
  (`heroku login`)
- Twilio: a Twilio account (for sending and receiving SMS)

Whew, that's a long list! Our apps are beginning to get really complicated. Cool
beans.

## Phase 1. Data model

Start by creating your app's data model, including your Mongoose schemes and
models. Think about which classes you'll need. You definitely need a User class
for passport local authentication. How are you going to represent the contact
list, and the messages?

The first step is to export your mongo connection string from
`models/connect.js` (note that this file will not be committed to git since it
contains sensitive information).

Then fill in the Mongoose user schema and export the model in `models/user.js`.

Go ahead and create other model classes in `models/` as necessary.

## Phase 2. Passport local auth

With your data model in place, the next step is to get login and accounts
working with Passport's LocalStrategy. You did this as part of the
[Passport-Form](https://github.com/horizons-school-of-technology/week04/tree/master/day1/passport_form)
exercise yesterday.

## Phase 3. Views

You now have a basic multiuser Expressjs application that allows the user to
login and logout, but it doesn't do anything interesting yet. Let's change that.
In this phase, you'll need to build the views for your application. It's up to
you to decide exactly how many views you need, how they should look, and how
they connect, but at a bare minimum you're going to need two: one main
"homepage" view that lists contacts and the number of messages per contact, and
one "contact" view that lets you view the message flow for each contact/send
messages to that contact.

Create these views now, and try populating them with sample data for now.

## Phase 4. Create, edit contacts

The next step is to allow the user to create contact data in your app. Create
the "new contact" form, if you haven't already, and wire it up so that the user
can create contacts. Now create some real contact data in your app--you're going
to need it soon!

## Phase 5. Outgoing SMS

Now that your app has a contact list, the next step is also the most
interesting--let's make the app do something useful! In particular, let's add
the ability to send outgoing SMS messages. We're going to use Twilio to do this.

You did this already in the
[TwilioShoutout](https://github.com/horizons-school-of-technology/week02/tree/master/day4/1_twilio)
project.

Note that, in order to send outgoing SMS messages from a user's Twilio account,
we need that user's Twilio account ID, auth token, and Twilio number.

Wire up the send message form to allow outgoing messages via SMS. Note that,
unless you want to enter your credit card information into Twilio, you will only
be able to SMS yourself for free.

## Phase 6. Delayed send

We'll be using the [Heroku
scheduler](https://devcenter.heroku.com/articles/scheduler) to implement delayed
send. Think about how this affects your data model, and about how to build a job
that checks for and sends pending messages.

## Phase 7. Incoming SMS

Now that all of our outgoing messages are working, let's add support for
incoming messages--because a conversation is pretty boring if it's
one-directional! We need to set up a Twilio webhook to do this.

## Bonus

- Add AJAX-based sorting of the contact list/table on the main page, as in
  [Horizonstarter AJAX].
- Make message send happen via AJAX, and make incoming messages show up in
  (quasi) real time using AJAX, as in [Horizonstarter AJAX].
- Allow sending messages to multiple users at once.
- Create true multi-party "threading" functionality: if a user composes a
  message to contacts A, B, and C, then if _any_ of those contacts responds to
  the message, it goes to _everyone_ on the thread.

[Horizonstarter AJAX]: https://github.com/horizons-school-of-technology/week03/tree/master/day5/horizonstarter-ajax
