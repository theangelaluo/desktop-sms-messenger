# Pair programming exercise: Double Message Part 2

**NOTE:** This is a continuation of [Part 1](readme-part1.md).

## Contents

- [Goal](#goal)
- [Step 5. Facebook login](#step-5-facebook-login)
- [BONUS](#bonus)

## Goal

In Part 2, you're going to add some awesome new features and functionality to your Double Message app:

- Facebook login (using OAuth)
- Load contact list from Facebook

## Step 6. Facebook login

Right now it's only possible to login to your app using a username and password, but lots of modern apps allow users to login using credentials from another site such as Facebook, Google, Twitter, etc. This happens using the [OAuth 2.0](http://oauth.net/2/) protocol as discussed in class this morning. These sites, such as Facebook, act as _identity providers_. Let's add the ability for a user to login to our app using Facebook.

We're going to use the [passport-facebook](https://github.com/jaredhanson/passport-facebook) strategy for [passportjs](http://passportjs.org/) to do this. The [passport-facebook](https://github.com/jaredhanson/passport-facebook) instructions are pretty good, but we'll walk through the required steps here too.

You'll need a Facebook app ID. Head to https://developers.facebook.com/ (log into your Facebook account if necessary):

![Facebook developers](http://cl.ly/3R12272a3u2K/Image%202016-06-21%20at%2019.06.47.png)

Then tap My Apps at the top right corner, and then Add a New App:

![My apps](http://cl.ly/1S3I0e2B1e0e/Image%202016-06-21%20at%2019.07.05.png)

Enter a name such as "Double Message" along with an email address. You will also need to pick a category then tap Create App ID:

![](http://cl.ly/3E1J172y0U1H/Image%202016-06-21%20at%2019.08.03.png)

Respond to the captcha, then proceed by clicking "Add Product" on the left sidebar. Select "Facebook Login" choosing Website as the platform and when prompted for a Site URL enter:

    http://localhost:3000

![Platform](http://cl.ly/1t3T2M1w3H06/Image%202016-06-21%20at%2019.07.16.png)


![site URL](http://cl.ly/0a2B1E141Q1V/Image%202016-06-21%20at%2019.16.24.png)

Finally, copy the App ID and App Secret from the next screen:

![app ID](http://cl.ly/0I32171G2I1z/Image%202016-06-21%20at%2019.09.38.png)

Back in your `app.js` file, require the `passport-facebook` strategy:

```javascript
var FacebookStrategy = require('passport-facebook');
```

Then add code to configure the strategy immediately below where you're configuring the passport LocalStrategy:

**Note:** `User.findOrCreate` in the below code is a placeholder; this method does not currently exist on your `User` model. You need to fill this in and update your User model accordingly. __Don't forget__ to add `facebookId` to your user schema (it will be a `String`) so that your `facebookId` is stored in `MongoDB` when you log in.

`findOrCreate`: This function has the following three parameters:
1. `Object`: The property used to find an item in MongoDB
1. `Object`: Properties that aren't used in the find call, but will be added to the object if it is created
1. `Function`: Callback function

```javascript
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, { phone: process.env.FROM_PHONE }, function (err, user) {
      return cb(err, user);
    });
  }
));
```

Fill in your Facebook App ID and App Secret which you copied from Facebook a moment ago.

Add the following routes to your `routes/auth.js` file to allow Facebook authentication:

```javascript
router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);
```

The final step is to add a button or a link on the login page that says "Login with Facebook", linking to `/auth/facebook`. We'll let you handle that part!

Congrats, you have successfully set up Facebook OAuth! Now let's move on to getting access to the list of Facebook friends using Double Message.

## Step 7. Facebook Profile Picture

This step will walk you through displaying your profile picture & your username on the Home Page of your Application.

First add the following property to your `User` model:
- `pictureURL`: String

As a part of your FacebookStrategy you should also specify what `profileFields` should be included in the callback object, like so:
```js
{
  clientID: process.env.FB_CLIENT_ID,
  clientSecret: process.env.FB_CLIENT_SECRET,
  callbackURL: "http://[you-url-here]/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'photos']
}
```

Then modify your passport `FacebookStrategy` to store the required data:
- `pictureURL` can be found at `profile.photos[0].value`
- `username` should be set to `profile.displayName`

1. Edit the `GET /contacts` request to send user information (from the `User` model) to `contacts.hbs` along with the current user's contacts.
1. Open `views/contacts.hbs` and show `username` and `picture` (as an image) at the top of your page. _Remember_ that the picture should only be shown if they logged in through Facebook.
1. Run your Node App and make sure it works. A potential example can be found below:

![](images/7_picture.png)

## BONUS

- [Send messages in bulk to many users at a
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
