# Pair programming exercise: Double Message Part 2

**NOTE:** This is a continuation of [Part 1](readme-part1.md).

## Contents

- [Goal](#goal)
- [Step 6. Facebook login](#step-6-facebook-login)
- [Step 7. Outgoing email](#step-7-outgoing-email)
- [Step 8. Incoming email](#step-8-incoming-email)
- [BONUS](#bonus)

## Goal

In Part 2, you're going to add some awesome new features and functionality to
your Double Message app:

- Facebook login (using OAuth)
- Send and receive email (using Sendgrid)

## Step 6. Facebook login

Right now it's only possible to login to your app using a username and password,
but lots of modern apps allow users to login using credentials from another site
such as Facebook, Google, Twitter, etc. This happens using the [OAuth
2.0](http://oauth.net/2/) protocol as discussed in class this morning. These
sites, such as Facebook, act as _identity providers_. Let's add the ability for
a user to login to our app using Facebook.

We're going to use the
[passport-facebook](https://github.com/jaredhanson/passport-facebook) strategy
for [passportjs](http://passportjs.org/) to do this. The
[passport-facebook](https://github.com/jaredhanson/passport-facebook)
instructions are pretty good, but we'll walk through the required steps here
too.

You'll need a Facebook app ID. Head to https://developers.facebook.com/ (log
into your Facebook account if necessary):

![Facebook developers](http://cl.ly/3R12272a3u2K/Image%202016-06-21%20at%2019.06.47.png)

Then tap My Apps at the top right corner, and then Add a New App:

![My apps](http://cl.ly/1S3I0e2B1e0e/Image%202016-06-21%20at%2019.07.05.png)

After selecting "Add Product" and then "Facebook Login" proceed by choosing Website as the platform:

![Platform](http://cl.ly/1t3T2M1w3H06/Image%202016-06-21%20at%2019.07.16.png)

Enter a name such as "Double Message" and tap Create New Facebook App ID:

![Name](http://cl.ly/3y2a1A3G0O0P/Image%202016-06-21%20at%2019.07.36.png)

Enter an email address and pick a category on the next screen and tap Create App
ID:

![](http://cl.ly/3E1J172y0U1H/Image%202016-06-21%20at%2019.08.03.png)

Respond to the captcha, then at the bottom of the next page under Site URL
enter:

    http://localhost:3000

and hit Next.

![site URL](http://cl.ly/0a2B1E141Q1V/Image%202016-06-21%20at%2019.16.24.png)

On the next page, hit Skip Quick Start at the top right corner:

![done](http://cl.ly/3L3S3Q172H3s/Image%202016-06-21%20at%2019.08.32.png)

Finally, copy the App ID and App Secret from the next screen:

![app ID](http://cl.ly/0I32171G2I1z/Image%202016-06-21%20at%2019.09.38.png)

Back in your `app.js` file, require the passport-facebook strategy:

```javascript
var FacebookStrategy = require('passport-facebook');
```

Then add code to configure the strategy immediately below where you're
configuring the passport LocalStrategy:

```javascript
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
```

Fill in your Facebook App ID and App Secret which you copied from Facebook a
moment ago.

**Note:** `User.findOrCreate` in the above code is a placeholder; this method
does not currently exist on your `User` model. You need to fill this in and
update your User model accordingly.

Add the following routes to your `routes/auth.js` file to allow
Facebook authentication:

```javascript
router.get('/auth/facebook',
  passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
```

The final step is to add a button or a link on the login page that says "Login
with Facebook", linking to `/auth/facebook`. We'll let you handle that part!


## Step 7. Outgoing email

Let's add support for outgoing email as well. We're going to use Sendgrid as our
email provider. If you haven't set up a Sendgrid account yet, follow the
instructions in the [Sendgrid inline
exercise](https://github.com/horizons-school-of-technology/week04/tree/master/day2/sendgrid)
to set one up now.

Grab your [Sendgrid API
key](https://app.sendgrid.com/settings/api_keys) and install the
[sendgrid-nodejs](https://github.com/sendgrid/sendgrid-nodejs) package. As with
Twilio, we'll need a user's Sendgrid API key to send and receive messages on
their behalf.

You'll need to make a couple of changes to your data model to support sending
email:

- A Contact should have an email address
- A Message should have a channel ("email" or "sms")

You'll also need to make a few cosmetic changes to your app's views:

- In the edit contact view, you'll need to add a field for an email address.
- In the contacts view, you'll need to add a column to display contacts' email
  addresses.
- In the messages view, you'll need to display which channel a message was sent
  or received on.
- In the new message view, you'll need to add a selector, such as a radio button
  (`<input type="radio"...>`) to select the channel to send the message on.

You'll need to add a couple of environment variables, one for your sendgrid API
key, the other for the "from" email address that sendgrid should use when
sending email (you'll want to use something '@' yourdomain.joinhorizons.com e.g.
'lane@lane.joinhorizons.com'--the part before the '@' symbol doesn't matter!).

Finally, and most substantially, you'll need to add code in your `POST
/messages/send` route that reads the `channel` argument from the form and routes
your message accordingly, via SMS or email. You should use the sample code at
[sendgrid-nodejs](https://github.com/sendgrid/sendgrid-nodejs) to write the
sendgrid code. Make sure you read the API key and from email address from the
environment.


## Step 8. Incoming email

We'll be using the [Sendgrid Inbound parse
webhook](https://sendgrid.com/docs/API_Reference/Webhooks/parse.html) to receive
incoming messages.

You'll need to install another npm module for this, called
[multer](https://github.com/expressjs/multer), to receive the form data sendgrid
will send you (which comes in a slightly different format).

Create a webhook to receive incoming email at e.g. `/messages/receive_email` to
complement the existing incoming SMS webhook. Per the multer readme, you should
use this format to create the webhook:

```javascript
router.post('/messages/receive_email', upload.array(), function(req, res, next) {
  // Your code here
  // Incoming email data in req.body
});

```

Next, configure the webhook on sendgrid. Log into your Sendgrid account at
https://app.sendgrid.com/, then tap Settings on the left bar, then Inbound Parse
from the dropdown menu.  Click "Add Host & URL" at the top right corner:

![add host](http://cl.ly/253d2X0h1J3K/Image%202016-06-22%20at%2000.45.57.png)

Under hostname, enter the `name.joinhorizons.com` subdomain that you were given.
Under URL, enter the Heroku URL for your app including the path to the webhook.
You can leave the other two options unchecked:

![add host 2](http://cl.ly/1e2z0y1v1d1g/Image%202016-06-22%20at%2000.46.59.png)

Click Save. Now try sending an email to this subdomain. The part before the '@'
symbol doesn't matter. An email sent to any address
'@yourdomain.joinhorizons.com' should cause the webhook to fire. Give it a shot!


## BONUS

- Right now, everyone who logs in can see everyone else's contacts and
  conversations. Change this to resemble a real app with permissions: users can
  only see contacts that they created, and they can only see their conversations
  with their contacts.
- [Send/schedule messages in bulk to many users at a
  time](https://docs.google.com/presentation/d/1vq9b1ENst72z1v0JgxGkhjZA6bggbgCNWO-CNf3zrIc/edit#slide=id.g11476959af_5_167)
  (if you didn't get to this yesterday).
- Create true multi-party "threading" functionality: if a user composes a
  message to contacts A, B, and C, then if _any_ of those contacts responds to
  the message, it goes to _everyone_ on the thread.

Add the following to OAuth:

- If a user who is already registered using Facebook subsequently tries to
  register using a username and password.
- If a user registers with a username and password, then subsequently tries to
  register, or log in, using Facebook.
- If a user who is already registered with a username and password wants to link
  their Facebook account so that they can log in using Facebook in the future.
- If a user wants to unlink their Facebook account.
