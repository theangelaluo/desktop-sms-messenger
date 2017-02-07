# Pair programming exercise: Double Message Part 1

## Contents

- [Goal](#goal)
- [Step 1. Create and edit contacts](#step-1-create-and-edit-contacts)
- [Step 2: User accounts and login](#step-2-user-accounts-and-login)
- [Step 3: Sending a text message to a contact](#step-3-sending-a-text-message-to-a-contact)
- [Step 4: Receiving text messages by webhooks](#step-4-receiving-text-messages-by-webhooks)
- [Step 5: Schedule text messages to send](#step-5-scheduling)
- [Bonus](#bonus)

## Goal

In this exercise, you're going to build a basic personal relationship manager (PRM) app 
called Double Message. The app will allow you to see and manage conversations with a list
of people via multiple channels, such as email and SMS, from a single view. Today, you will
be doing the first half of this with SMS. This means, by the end of the day, you will be 
able to send, receive and schedule text messages from your browser! 

Tomorrow we'll add Facebook authentication using OAuth and a few other features
 in [Part 2](./readme-part2.md).

You will be working in the `double-message` folder. Make sure you create
`models/connect.js` with your Mongo connection string as you have done before.

```javascript
module.exports = "MONGO CONNECTION STRING HERE";
```

See [user interface drawings](https://docs.google.com/presentation/d/1vq9b1ENst72z1v0JgxGkhjZA6bggbgCNWO-CNf3zrIc/edit?usp=sharing).

## Step 1: Create and edit contacts

### Contact Models 👯 - `models/models.js`

Start by creating models for each contact you will store for a user. Define all your models
in a `models.js` file that connects to a MongoDB database (on mLab, for example) and 
create the following fields:

- New model `Contact`
	- `name`: `String`: Name of the contact
	- `phone`: `String`: 10-digit number without the `+` <br>
	  ex. (212) 555 1203 becomes 12125551203

### Contact Views 🌠 - `views/contacts.hbs`, `views/editContact.hbs`

[Check out our user interface drawings.](https://docs.google.com/presentation/d/1vq9b1ENst72z1v0JgxGkhjZA6bggbgCNWO-CNf3zrIc/edit#slide=id.g1147692423_0_28)

- [`views/contacts.hbs`](https://docs.google.com/presentation/d/1vq9b1ENst72z1v0JgxGkhjZA6bggbgCNWO-CNf3zrIc/edit#slide=id.p): 
    A list of all contacts that the user has created.
- [`views/editContact.hbs`](https://docs.google.com/presentation/d/1vq9b1ENst72z1v0JgxGkhjZA6bggbgCNWO-CNf3zrIc/edit#slide=id.g1147692423_0_133):
    A form that allows a user to edit contact details for an existing user, or to create a new user.

### Contact Routes 📲 - `routes/index.js`

Next, define routes for creating, getting, and updating your contacts through an Express
router inside an `index.js` file. Each route will render the views (which you created earlier) 
with a context object that loads your models from the database (which you also created
earlier).

- `GET /contacts`
	- Read contacts from Mongoose
	- Render contacts using `contact.hbs`
- `GET /contacts/new`
	- Render `editContact.hbs` with no contact
- `GET /contacts/:id`
	- Read contact with id from mongoose
	- Render `editContact.hbs` with contact
- `POST /contacts/new`
	- Create new contact
	- Redirect to /contacts
- `POST /contacts/:id`
	- Update contact with given id
	- Redirect to /contacts

## Step 2: User accounts and login

### Setting up `passport` 🛂 - `app.js`

1. Install `passport` `passport-local` and `express-session`

	```bash
	npm install --save passport passport-local express-session
	```

1. Create your local strategy **before** your routes:

	```javascript
	var session = require('express-session');
	app.use(session({ secret: 'keyboard cat' }));

	// Tell Passport how to set req.user
	passport.serializeUser(function(user, done) {
	  done(null, user._id);
	});
	 
	passport.deserializeUser(function(id, done) {
	  User.findById(id, function(err, user) {
	    done(err, user);
	  });
	});
	
	// Tell passport how to read our user models
	passport.use(new LocalStrategy(function(username, password, done) {
	  // Find the user with the given username
	    User.findOne({ username: username }, function (err, user) {
	      // if there's an error, finish trying to authenticate (auth failed)
	      if (err) { 
	        console.log(err);
	        return done(err);
	      }
	      // if no user present, auth failed
	      if (!user) {
	        console.log(user);
	        return done(null, false);
	      }
	      // if passwords do not match, auth failed
	      if (user.password !== password) {
	        return done(null, false);
	      }
	      // auth has has succeeded
	      return done(null, user);
	    });
	  }
	));
	
	app.use(passport.initialize());
	app.use(passport.session());
	```


### User account model 👥 - `models/models.js`

- New model `User`
	- `username`: `String`: user name
	- `password`: `String`: password
	- `phone`: `String`: 10 digit phone number of the user. Used to associate incoming messages.
- Update model `Contact`
	- new property `owner`: `UserId`: `_id` of the user who created this contact 

### User account views 🗻 - `views/signup.hbs`, `views/login.hbs`

- [`views/signup.hbs`](https://docs.google.com/presentation/d/1vq9b1ENst72z1v0JgxGkhjZA6bggbgCNWO-CNf3zrIc/edit#slide=id.g1147692423_0_161)
- [`views/login.hbs`](https://docs.google.com/presentation/d/1vq9b1ENst72z1v0JgxGkhjZA6bggbgCNWO-CNf3zrIc/edit#slide=id.g1147692423_0_340)

### User routes 🚥 - `routes/auth.js`

- `GET /`
	- If user logged in redirect to `/contacts`
	- If user not logged in redirect to `/login`
- `GET /signup`
	- Render `signup.hbs`
- `POST /signup`
	- Validate User fields
		- User name is not empty
		- Password is not empty
		- Passwords match
	- Create new user
	- Redirect to `/login`
- `GET /login`
	- Render `login.hbs`
- `POST /login`
	- Pass request onto Passport with `passport.authenticate('local')`
	- If successful redirect to `/contacts`
	- If unsuccessful redirect to `/login`

## Step 3: Sending a text message to a contact

### Models for sending message ✉️ - `models/models.js`

- `Message`
	-  `created`: `Date`: when the messages was first created
	- `content`: `String`: content of the message
	- `user`: `UserId`: the `_id` of the User this message belongs to
	- `contact`: `ContactId`: the `_id` of the Contact the message was sent to (or from for incoming)

### Views for sending message 📬 - `views/newMessage.hbs`, `views/message.hbs`

- [`views/newMessage.hbs`](https://docs.google.com/presentation/d/1vq9b1ENst72z1v0JgxGkhjZA6bggbgCNWO-CNf3zrIc/edit#slide=id.g1147692423_0_442) Send a new message
- [`views/messages.hbs`](https://docs.google.com/presentation/d/1vq9b1ENst72z1v0JgxGkhjZA6bggbgCNWO-CNf3zrIc/edit#slide=id.g1147692423_0_230)

You will use `views/message.hbs` for both the Conversation Stream (all ingoing and outgoing messages) and the conversation with an individual person. 

### Routes for sending message 👮 - `routes/index.js`

- `GET /messages`
	- Read all messages from mongoose
	- Render `messages.hbs` with all messages
- `GET /messages/:contactId`
	- Read messages sent to contactId
	- Render `messages.hbs` with messages sent to contact
- `GET /messages/send/:contactId`
  - Render `newMessage.hbs` for a form to send a message to a contact by `contactId`
- `POST /messages/send/:contactId`
	- Send message with Twilio to the number corresponding to a contact by `contactId`
	- Create message in mongoose if Twilio is successful
	- Redirect to `/messages`
	
For `POST /messages/send/:contactId`, you'll have to use [Twilio's Node client](https://www.npmjs.com/package/twilio) - remember from today? Don't forget to `npm i -S twilio` and to include your `accountSid` and `authToken`. See more documentation on Twilio's Node package here: [https://www.twilio.com/docs/api/rest/sending-messages](https://www.twilio.com/docs/api/rest/sending-messages)

## Step 4: Receiving Text Messages by Webhooks

You'll be using webhooks to receive messages from Twilio and trigger an action on your backend to
create a new Message model. Once we set up Twilio's webhook with your phone number later,
Twilio will POST a request to your backend with data that will be formatted as follows:

<table>
<thead>
<tr>
<th align="left">Parameter Name</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td align="left">EventType</td>
<td>string</td>
<td>always:  "onMessageSend"</td>
</tr>
<tr>
<td align="left">ChannelSid</td>
<td>string</td>
<td>Channel Sid identifier of the Channel the Message is being sent to</td>
</tr>
<tr>
<td align="left">Body</td>
<td>string</td>
<td>The body of message</td>
</tr>
<tr>
<td align="left">Attributes</td>
<td>string, optional, valid JSON structure or null</td>
<td>stringified JSON structure, can be null if attributes are not present in message entity</td>
</tr>
<tr>
<td align="left">From</td>
<td>string</td>
<td>The author of the message</td>
</tr>
<tr>
<td align="left">DateCreated</td>
<td>date string</td>
<td>The timestamp of creation of the message</td>
</tr>
</tbody>
</table>

### Creating a route for your webhook 🚚 - `routes/index.js`

- `POST /messages/receive` - Your request body will take the properties above, but your route only has to handle:
	- `Body` - body of message (_careful! it'll live at `req.body.Body`_)
	- `From` - phone number of sender

### Models changes for receiving text messages 💬 - `models/models.js`

- Update `Message` model
	- New field `status`: `String`: indicate whether this message was sent or receieved
		- `sent`: this message has been sent to Twillio
		- `received`: this message has been received by Twillio
	- New field `from`: `String`: 10 digit phone number string. This field will be empty for messages that are sent.
		- ex. (212) 555-1234 becomes "12125551234"

### Setting up Twilio

> ⚠️ _**Note**: This section requires that you have deployed your branch to a new Heroku dyno.
We will be walking through the deployment process, but you can try this yourself if you get here by
following [these instructions](https://devcenter.heroku.com/articles/git) for deploying from a branch -
don't deploy from `master`! Make sure you have the [Heroku Toolbelt](https://toolbelt.heroku.com)!._

Next, we'll connect Twilio to your backend to send a POST request every time a user sends a text back to your number. 
This requires some Twilio setup beforehand - we'll walk you through that below:    
    
### Creating your Twilio Number 📞 - `twilio.com`  

> ⚠️ _**Note:** You may have already have a number from a previous exercise. If that's the case, skip down to Registering
a Webhook._

Get started by logging into [Twilio](https://twilio.com) and going to your Console (the Twilio user dashboard). 
You should have created an account for a previous exercise, but if not, [register for a trial account here](https://www.twilio.com/try-twilio).  

In your Twilio Console, click on the Phone Numbers tab as displayed below and navigate to Getting Started. Here,
you'll be able to create a free phone number using your trial account that will allow you to set webhooks upon
different events, like receiving a phone call or a text message!

<img src="http://cl.ly/3n0E023W441c/Image%202016-06-21%20at%207.57.46%20AM.png" width="500">

Follow the big red button to get your number, and you will be prompted to go ahead and create the number:

<img src="http://cl.ly/3E1x3D1C1y3Q/Image%202016-06-21%20at%207.59.04%20AM.png" width="500">

### Registering a Webhook 🔗 - `twilio.com`

View your created Phone Numbers on Twilio by clicking the Phone Numbers tab in the Twilio Console. If you've done
everything correctly, you should see your newly (or previously) created phone number within "Active Numbers," like below:

<img src="http://f.cl.ly/items/2v1W2c1M0M2d2139013O/Image%202016-06-21%20at%208.01.47%20AM.png" width="500">

From here, click your Phone Number to edit details about actions related to the phone number:
    
<img src="http://f.cl.ly/items/043U0k0w230S3Z100C3y/Image%202016-06-21%20at%208.02.54%20AM.png" width="500">

Scroll down to Messaging and add your Heroku URL with your route to `/messages/receive` to the "Webhook" field of
Incoming Message. Don't forget to Save, and you're good to go! Try texting your Twilio number to verify that your
endpoint works!

## Step 5: Scheduling

### Model changes for scheduling 🕒 - `models/models.js`

- Update `Message` model
	- Update property `status`:
		New  value `scheduled`. This indicates that a message has been scheduled to send but not yet sent.
	- New property `timeToSend`: `Date`: When to send this message. Message will only be sent on or after this point in time.

### Routes for scheduling 🕰 - `routes/index.js`

- `GET /messages/sendScheduled`
	- Get all messages `status === 'scheduled'` from mongoose
	- Send messages where `timeToSend` is in the past
	- Update sent messages and set status to `sent`
	- On success `res.send('Success!')
	- On error `res.status(500).send('Error sending')`

### View changes for scheduling ⏳ - `views/newMessage.hbs`, `views/messages.hbs`

- `views/newMessage.hbs`: Add the ability to schedule messages to the new message view.
	- [Step 1](https://docs.google.com/presentation/d/1vq9b1ENst72z1v0JgxGkhjZA6bggbgCNWO-CNf3zrIc/edit#slide=id.g1147692423_0_753)
	- [Step 2](https://docs.google.com/presentation/d/1vq9b1ENst72z1v0JgxGkhjZA6bggbgCNWO-CNf3zrIc/edit#slide=id.g1147692423_0_740)
- [`views/messages.hbs`](https://docs.google.com/presentation/d/1vq9b1ENst72z1v0JgxGkhjZA6bggbgCNWO-CNf3zrIc/edit#slide=id.g1147692423_0_810):
    Add section to show scheduled messages.

### Testing scheduling locally

To test scheduling locally:

- Create some messages scheduled to send in the past.
- Visit [`http://localhost:3000/messages/sendScheduled`](http://localhost:3000/messages/sendScheduled)
- Make sure scheduled messages are sent.

### Setting Up Scheduling with Heroku ⛑ - `heroku.com`

> ⚠️ _**Note**: This section requires that you have deployed your branch to a new Heroku dyno.
We will be walking through the deployment process, but you can try this yourself if you get here by
following [these instructions](https://devcenter.heroku.com/articles/git) for deploying from a branch -
don't deploy from `master`! Make sure you have the [Heroku Toolbelt](https://toolbelt.heroku.com)!._

We will be using a [Heroku Addon](https://elements.heroku.com) called Scheduler to periodically
run a script that we've created for you: `schedule.js`. Check it out - it's just a script that requests the route
`http://localhost:3000/messages/sendScheduled` - which you wrote before! 

Start by going to the [Heroku Elements page for Scheduler](https://elements.heroku.com/addons/scheduler).

<img src="http://cl.ly/3j2A280b1X1C/Image%202016-06-21%20at%208.21.13%20AM.png" width="500">

Click **Install Heroku Scheduler** and select your dyno (sorry, we took the name `doublemessage`). 

<img src="http://cl.ly/3E2E3m042d0m/Image%202016-06-21%20at%208.21.28%20AM.png" width="500">

You will now be redirected to the Heroku Dashboard for your dyno. Go to the Resources tab and under the Add-ons section, click Scheduler. 

<img src="http://cl.ly/0h3r0P3s2A01/Image%202016-06-21%20at%208.23.44%20AM.png" width="500"> 

It will open a new page that looks like the image below. Click **Add a new job** and set  the command to `node schedule.js`.


<img src="http://cl.ly/2u1y321A0Y1Y/Image%202016-06-21%20at%208.23.54%20AM.png" width="500">

**Set the frequency to Hourly!** You want to be checking fairly frequently for messages that need to be sent from the delayed queue. 

<img src="http://cl.ly/0i2I120v2j0x/Image%202016-06-21%20at%208.24.26%20AM.png" width="500">

That's it! You can test to make sure that your route for delayed messages is working by manually calling `node schedule.js`, which will request the route `/messages/sendScheduled` on your server. 


## Getting portfolio-ready (a bonus you should try!)

If you really want to start making this project one that is user-ready (and therefore portfolio ready), we would recommend the following (in prioritized order):

- [Send Messages via AJAX!] (https://docs.google.com/presentation/d/1vq9b1ENst72z1v0JgxGkhjZA6bggbgCNWO-CNf3zrIc/edit#slide=id.g11476959af_5_380)
- [Send / Schedules messages in bulk to many users at a time!] (https://docs.google.com/presentation/d/1vq9b1ENst72z1v0JgxGkhjZA6bggbgCNWO-CNf3zrIc/edit#slide=id.g11476959af_5_167)
- [Make your Conversation Stream "real-time". Use Ajax to update the stream every 30 seconds!] (https://docs.google.com/presentation/d/1vq9b1ENst72z1v0JgxGkhjZA6bggbgCNWO-CNf3zrIc/edit#slide=id.g11476959af_5_395)
