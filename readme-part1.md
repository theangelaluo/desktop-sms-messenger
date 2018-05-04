# Pair programming exercise: Double Message Part 1

## Contents

- [Goal](#goal)
- [Step 1: User accounts and login](#step-1-user-accounts-and-login)
- [Step 2: Create and edit contacts](#step-2-create-and-edit-contacts)
- [Step 3: Sending a text message to a contact](#step-3-sending-a-text-message-to-a-contact)
- [Step 4: Pushing your app to Heroku](#step-4-pushing-your-app-to-heroku)
- [Step 5: Receiving text messages by webhooks](#step-5-receiving-text-messages-by-webhooks)
- [Bonus](#bonus)

## Goal

In this exercise, you're going to build a basic personal relationship manager (PRM) app called Double Message. The app will allow you to see and manage conversations with a list of people via SMS from a single view. Today, you will be doing the first half of this with SMS. This means, by the end of the day, you will be able to send and receive text messages from your browser!

Tomorrow, in [Part 2](./readme-part2.md), we'll add Facebook & Twitter authentication using OAuth and a few other features.

You will be working in the `double-message` folder. Create a new file called `env.sh`:

```bash
export MONGODB_URI="YOUR MONGODB LINK HERE"
```

Let's create a new database on mLab and paste the given link in `env.sh`.

> TIP: Remember to do `source env.sh`

Next, look through the [user interface drawings](https://docs.google.com/presentation/d/1UXsnAr9Vu3s0M3khMnlnYU5V3fCnFGkkbL1pTFIXJu4/edit#slide=id.g1147692423_0_157).

## Step 1: User accounts and login

### User account model 👥 - `models/models.js`

Let's begin by first creating a model for user:

- New model `User`
	- `username`: `String`: user name
	- `password`: `String`: password
	- `phone`: `String`: 10 digit phone number of the user. Used to associate incoming messages.

### Setting up `passport` 🛂 - `app.js`

1. Install `passport`, `passport-local` and `express-session`

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
	}));

	app.use(passport.initialize());
	app.use(passport.session());
	```

1. Remember to require the `User` model and node modules that you are using:

	```javascript
	var passport = require('passport');
	var LocalStrategy = require('passport-local').Strategy;

	var models = require('./models/models');
	var User = models.User;
	```

1. Now uncomment your routes in `app.js` so that it looks like this:

	```javascript
	app.use('/', auth(passport));
	app.use('/', routes);
	```

### User account views 🗻 - `views/signup.hbs`, `views/login.hbs`

In this step you will be working in/creating the `views/signup.hbs` and `views/login.hbs` handlebars files. We've drawn up some wireframes that you should use as reference when creating these views (they can be found at the links below).

- [`views/signup.hbs`](https://docs.google.com/presentation/d/1UXsnAr9Vu3s0M3khMnlnYU5V3fCnFGkkbL1pTFIXJu4/edit#slide=id.g1147692423_0_161)
- [`views/login.hbs`](https://docs.google.com/presentation/d/1UXsnAr9Vu3s0M3khMnlnYU5V3fCnFGkkbL1pTFIXJu4/edit#slide=id.g1147692423_0_340)

#### TIP:
- `signup.hbs` should have `username`, `password`, and `passwordRepeat` for input text fields.
- `login.hbs` should have `username` and `password` for input text fields with a login and register button.

> Check the routes below on where to redirect the user to when he or she clicks on those buttons.

### User routes 🚥 - `routes/auth.js`

- `GET /`
	- If user logged in redirect to `/contacts`
	- If user not logged in redirect to `/login`
- `GET /signup`
	- Render `signup.hbs`
- `POST /signup`
	- Validate User fields
		- Username is not empty
		- Password is not empty
		- Passwords match
	- Create new user
	- Redirect to `/login`
- `GET /login`
	- Render `login.hbs`
- `POST /login`
	- Pass request onto Passport with `passport.authenticate('local')`
	- If successful redirect to `/contacts` (TIP: successRedirect)
	- If unsuccessful redirect to `/login` (TIP: failureRedirect)
- `GET /logout`
  - Terminate the current session
  - Redirect to `/login`

> TIP: Remember to require your User model since we are using it in the `POST /signup` route to create a new user.
>
```javascript
var models = require('../models/models');
var User = models.User;
```

### Contact Routes 📲 - `routes/index.js`

- `GET /contacts`

	```javascript
	// This is just a test route, we will implement the details later
	router.get('/contacts', function(req, res) {
	  res.send('Successful login');
	});
	```

### Testing
We can now test our app by doing `npm start`. Don't forget to do `npm install` beforehand. (This reads your `package.json` and installs other node modules such as `express`.)

- You should be able to register a normal account and login using that normal account.
- You should be redirected to `/contacts` upon a successful login with the message: `Successful login`.

## Step 2: Create and edit contacts

We're good! Let's move on to creating and editing contacts.

### Contact Models 👯 - `models/models.js`

- New model `Contact`
	- `name`: `String`: Name of the contact
	- `phone`: `String`: 10-digit number without the `+1` _(ex. (212) 555 1203 becomes 2125551203)_
	- `owner`: Reference to the user who created this contact

	> TIP: `owner` field in the Schema is an object with the following key-value pairs:
	>
	```
	type: mongoose.Schema.ObjectId
	ref: 'User'
	```

### Contact Views 🌠 - `views/contacts.hbs`, `views/editContact.hbs`

In this step you will be working in/creating the `views/contacts.hbs` and `views/editContact.hbs` handlebars files. This is where you will create your views. We've drawn up some wireframes that you should use as reference when creating your frontend for Double Message (they can be found at the links below).

__Remember__ to the have the following elements on your `views/contacts.hbs` page:

- List of contacts
	- Contact name & phone number
	- __Send Text__ _Button_/_Link_
	- __View Messages__ _Button_/_Link_
	- __Edit Contact__ _Button_/_Link_
- __Add contact__ _Button_/_Link_
- __View all messages__ _Button_/_Link_
- __Logout__ _Button_/_Link_

[Check out our user interface drawings.](https://docs.google.com/presentation/d/1UXsnAr9Vu3s0M3khMnlnYU5V3fCnFGkkbL1pTFIXJu4/edit#slide=id.g1147692423_0_157)

- [`views/contacts.hbs`](https://docs.google.com/presentation/d/1UXsnAr9Vu3s0M3khMnlnYU5V3fCnFGkkbL1pTFIXJu4/edit#slide=id.p): A list of all contacts that the user has created.
- [`views/editContact.hbs`](https://docs.google.com/presentation/d/1UXsnAr9Vu3s0M3khMnlnYU5V3fCnFGkkbL1pTFIXJu4/edit#slide=id.g1147692423_0_133): A form that allows a user to edit contact details for an existing user, or to create a new user.

> Check the routes below on where to redirect the user to when he or she clicks on those buttons/links. For part 2, you do not need to worry about where to redirect users for __Send Text__, __View Messages__, and __View all messages__. We will fix those buttons/links in Part 3.

### Contact Routes 📲 - `routes/index.js`

Next, define routes for creating, getting, and updating your contacts through an Express router inside an `index.js` file. Each route will render the views (which you created earlier) with a context object that loads your models from the database (which you also created earlier).

- `GET /contacts`
	- Read __current user's__ contacts from Mongoose
	- Render contacts using `contact.hbs`
- `GET /contacts/new`
	- Render `editContact.hbs` with no contact
- `GET /contacts/:id`
	- Read contact with id from mongoose
	- Render `editContact.hbs` with contact
- `POST /contacts/new`
	- Create new contact for current user
	- Redirect to /contacts
- `POST /contacts/:id`
	- Update contact with given id
	- Redirect to /contacts

> TIP: Remember to require your Contact model since we are using it to create and update a new contact.
>
```javascript
var models = require('../models/models');
var Contact = models.Contact;
```

### Testing

- You should be able to create a new contact (or multiple contacts) using the __Add contact__ _Button_/_Link_
- You should be able to edit existing contacts using the __Edit Contact__ _Button_/_Link_
- You should be able to logout using the __Logout__ _Button_/_Link_
- You should be able to view a list of contacts in `http://localhost:3000/contacts`.

## Step 3: Sending a text message to a contact

### Models for sending message ✉️ - `models/models.js`

- `Message`
	-  `created`: `Date`: when the messages was first created
	- `content`: `String`: content of the message
	- `user`: Reference to the `User` that this message belongs to
	- `contact`: Reference to the `Contact` that this message was sent to (or from for incoming message)
	- `channel`: `String`: the channel used to send the message (should be "__SMS__")

> TIP: Remember how we created a reference field for `owner` in Contact previously? Use the same method for `user` and `contact` here.

### Views for sending message 📬 - `views/newMessage.hbs`, `views/messages.hbs`

In this step you will be working in/creating the `views/newMessage.hbs` and `views/messages.hbs` handlebars files. We've drawn up some wireframes that you should use as reference when creating these views (they can be found at the links below).

- [`views/newMessage.hbs`](https://docs.google.com/presentation/d/1UXsnAr9Vu3s0M3khMnlnYU5V3fCnFGkkbL1pTFIXJu4/edit#slide=id.g1147692423_0_621) Send a new message
- [`views/messages.hbs`](https://docs.google.com/presentation/d/1UXsnAr9Vu3s0M3khMnlnYU5V3fCnFGkkbL1pTFIXJu4/edit#slide=id.g1147692423_0_556)

You will use `views/messages.hbs` for both the Conversation Stream (View All Messages - all ingoing and outgoing messages) and the conversation with an individual person.

### Setting up Twillio

We will be using [Twilio's Node client](https://www.npmjs.com/package/twilio).

1. Run `npm install twilio --save`

1. In `routes/index.js`, let's configure our twilio node module at the top of the file.

	```javascript
	// Do not update your tokens here. Do it in env.sh
	var accountSid = process.env.TWILIO_SID; // Your Account SID from www.twilio.com/console
	var authToken = process.env.TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console
	var fromNumber = process.env.MY_TWILIO_NUMBER; // Your custom Twilio number
	var twilio = require('twilio');
	var client = new twilio(accountSid, authToken);
	```

1. Now, let's add the following into `env.sh`:

	```bash
	export TWILIO_SID="REPLACE THIS"
	export TWILIO_AUTH_TOKEN="REPLACE THIS"
	export MY_TWILIO_NUMBER="+14151234567"
	```

	> Replace the `MY_TWILIO_NUMBER` with an 11-digit phone number given by Twilio, prefixed by a `+` sign. Remember to replace those keys with the ones you obtained from Twilio's website and do `source env.sh` again.

1. Let's move on to our routes. We will use our Twilio API there.

### Routes for sending message 👮 - `routes/index.js`

- `GET /messages`
	- Read all messages from mongoose belonging to user (req.user._id)
	- Render `messages.hbs` with all messages
	- You might need to do `populate('contact')` to get the name of contact through messages.
- `GET /messages/:contactId`
	- Read messages sent to contactId (i.e. contact) belonging to user (req.user._id)
	- Render `messages.hbs` with messages sent to contact
	- You might need to do `populate('contact')` to get the name of contact through messages.
- `GET /messages/send/:contactId`
  - Render `newMessage.hbs` for a form to send a message to a contact by `contactId`
- `POST /messages/send/:contactId`
	- Send message with Twilio to the number corresponding to a contact by `contactId` (Refer to the tip below)
	- Create message in mongoose if Twilio is successful
	- Redirect to `/messages`

#### TIP for `POST /messages/send/:contactId`

```javascript
// We can send a Twilio message using client.messages.create

// We first create an object data with the key body, to, and from.
var data = {
  body: req.body.message,
  to: '+1' + contact.phone, // a 10-digit number
  from: fromNumber
};

client.messages.create(data, function(err, msg) {
  console.log(err, msg);

  // save our Message object and redirect the user here
});
```

> See more documentation on Twilio's Node package here: [https://www.twilio.com/docs/libraries/node](https://www.twilio.com/docs/libraries/node)

### Testing

- You should be able to send a message to an existing contact from your application. (Since we are using test accounts, the contact number needs to be your own phone number.)
- You should be able to view messages sent to a specific contact.
- You should be able to view all messages sent to everyone.

## Step 4: Pushing your app to Heroku

In order to set up Webhooks in [Step 5](step-5-receiving-text-messages-by-webhooks) you will need a Heroku URL. Let's walk through pushing your app to Heroku.

1. Make sure your app runs locally without errors
1. Download the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) (command line interface). You need this to be able to use heroku in your terminal
1. `heroku login`: Use this command to log in to heroku locally (in terminal)
      * **For Windows Users:** This command will **not** work in Git Bash, so you will need to run this command through the Windows Command Prompt. Once you log in, you should return to using git bash for the remaining commands. 
1. Navigate to the `double-message` folder on your computer
1. `heroku create`: This command will create a heroku application, and add `heroku` to your list of git remotes (`heroku` should be displayed when running the command `git remote`)
1. Use the command `git branch` to find the name of the branch you are currently on (you should __NOT__ be on `master`). If you are on `master`, do `git checkout -b YOUR-BRANCH-NAME-HERE`. Verify that you are on your own branch using `git branch` again.
1. If you have pending changes, do the following:

	```
	git add --all
	git commit -m "push to heroku"
	git status
	```
1. Ensure that there are no more pending changes through `git status`.
1. `git push heroku your-branch-name:master`: This will push your app and all of your changes from `your-branch-name` to your heroku application
1. Next, we need to copy all our environment variables in `env.sh` to Heroku. For all the key value pairs in env.sh, we need to do `heroku config:set key=value`.

	```
	# Comments:
	#   Execute these commands separately!
	#   Copy values from env.sh

	heroku config:set MONGODB_URI="MONGODB URI HERE"

	heroku config:set TWILIO_SID="ACCOUNT SID HERE"

	heroku config:set TWILIO_AUTH_TOKEN="AUTH TOKEN HERE"

	heroku config:set MY_TWILIO_NUMBER="FROM NUMBER HERE"
	```

1. Now, when you do `heroku config`, you should see 4 config variables.
1. `heroku open`: This should open your `double-message` application in your default web browser
1. Your app should also be present on your heroku dashboard.

### Testing

- Feel free to test everything that you have done from Step 1 to Step 3 to ensure that your heroku app is working properly.

> TIP: Use `heroku logs --tail` to view the current logs for your Heroku application. If your app crashed and you want to restart it, you can do `heroku restart`.

## Step 5: Receiving Text Messages by Webhooks

You'll be using [webhooks](https://webhooks.pbworks.com/w/page/13385124/FrontPage) to receive messages from Twilio and trigger an action on your backend to create a new Message model. Once we set up Twilio's webhook with your phone number later, Twilio will `POST` a request to your backend with data that will be formatted as follows:

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
<td align="left">...</td>
<td>...</td>
<td>...</td>
</tr>
<tr>
<td align="left">Body</td>
<td>string</td>
<td>The body of message</td>
</tr>
<tr>
<td align="left">From</td>
<td>string</td>
<td>A string containing an 11-digit number with the +1 prefix.</td>
</tr>
<tr>
<td align="left">To</td>
<td>string</td>
<td>A string containing an 11-digit number with the +1 prefix.</td>
</tr>
<tr>
<td align="left">...</td>
<td>...</td>
<td>...</td>
</tr>
</tbody>
</table>

> Do refer to the JSON document below for an example of `req.body`.

### Creating a route for your webhook 🚚 - `routes/index.js`

- `POST /messages/receive` - Your request body will take the properties above, but your route only has to handle:
	- `Body` - body of message (_careful! it'll live at `req.body.Body`_)
	- `From` - phone number of sender
	- `To` - phone number of recipient (It should be the number given by Twilio.)

This is an example of `req.body` when you do `console.log(req.body)` in the callback. (Note that all ids are just placeholders here)

```
{
    "ToCountry": "US",
    "ToState": "CA",
    "SmsMessageSid": "SM00000000000000000000000000000000",
    "NumMedia": "0",
    "ToCity": "",
    "FromZip": "94104",
    "SmsSid": "SM00000000000000000000000000000000",
    "FromState": "CA",
    "SmsStatus": "received",
    "FromCity": "SAN FRANCISCO",
    "Body": "Hello",
    "FromCountry": "US",
    "To": "+14159876543", // Number obtained from Twilio
    "ToZip": "",
    "NumSegments": "1",
    "MessageSid": "SM00000000000000000000000000000000",
    "AccountSid": "AC00000000000000000000000000000000",
    "From": "+14151234567", // My phone number
    "ApiVersion": "2010-04-01"
}
```

Observe that what we need is just `req.body.Body`, `req.body.From`, and `req.body.To`.

### Models changes for receiving text messages 💬 - `models/models.js`

- Update `Message` model
	- New field `status`: `String`: indicate whether this message was sent or received
		- `sent`: this message has been sent to Twilio
		- `received`: this message has been received by Twilio
	- New field `from`: `String`: 10 digit phone number string. This field will be __empty__ for messages that are sent.
		- ex. (212) 555-1234 becomes "2125551234"

	__Note__: Be sure to modify the code for `POST /messages/send/:contactId` to account for the above fields. You should also alter your frontend to display the `from` property.

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

In your Twilio Console, click on the Phone Numbers tab as displayed below and navigate to Getting Started. Here, you'll be able to create a free phone number using your trial account that will allow you to set webhooks upon different events, like receiving a phone call or a text message!

<img src="http://cl.ly/3n0E023W441c/Image%202016-06-21%20at%207.57.46%20AM.png" width="500">

Follow the big red button to get your number, and you will be prompted to go ahead and create the number:

<img src="http://cl.ly/3E1x3D1C1y3Q/Image%202016-06-21%20at%207.59.04%20AM.png" width="500">

### Registering a Webhook 🔗 - `twilio.com`

View your created Phone Numbers on Twilio by clicking the Phone Numbers tab in the Twilio Console. If you've done everything correctly, you should see your newly (or previously) created phone number within "Active Numbers," like below:

<img src="http://f.cl.ly/items/2v1W2c1M0M2d2139013O/Image%202016-06-21%20at%208.01.47%20AM.png" width="500">

From here, click your Phone Number to edit details about actions related to the phone number:

<img src="http://f.cl.ly/items/043U0k0w230S3Z100C3y/Image%202016-06-21%20at%208.02.54%20AM.png" width="500">

Scroll down to Messaging and add your Heroku URL with your route to `/messages/receive` to the "Webhook" field of
Incoming Message (i.e. `A MESSAGE COMES IN`). It should look like `https://project-name.herokuapp.com/messages/receive`

Don't forget to save, __push your changes__ to Heroku, and you're good to go! Try texting your Twilio number to verify that your endpoint works!

You need to do the following to push your changes to heroku:

```bash
git add --all
git commit -m "push to heroku"
git status
git push heroku your-branch-name:master
```

### Testing

- You should be able to send a message to your Twilio phone number from your own phone and view it through your application.

## Bonus

### Getting portfolio-ready (a bonus you should try!)

If you really want to start making this project one that is user-ready (and therefore portfolio ready), we would recommend the following (in prioritized order):

- [Send Messages via AJAX!](https://docs.google.com/presentation/d/1vq9b1ENst72z1v0JgxGkhjZA6bggbgCNWO-CNf3zrIc/edit#slide=id.g11476959af_5_380)
- [Send messages in bulk to many users at a time!](https://docs.google.com/presentation/d/1vq9b1ENst72z1v0JgxGkhjZA6bggbgCNWO-CNf3zrIc/edit#slide=id.g11476959af_5_167)
- [Make your Conversation Stream "real-time". Use Ajax to update the stream every 30 seconds!](https://docs.google.com/presentation/d/1vq9b1ENst72z1v0JgxGkhjZA6bggbgCNWO-CNf3zrIc/edit#slide=id.g11476959af_5_395)
