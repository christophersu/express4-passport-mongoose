var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/footprints');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {

});
var userModel = require('../models/user');
var User = mongoose.model('User');

var secrets = require('../config/secrets');
var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: secrets.FACEBOOK.CLIENT_ID,
    clientSecret: secrets.FACEBOOK.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({facebookId: profile["_json"]["id"]}, function(result) {
        if (result) {
            console.log('User found.');
            console.log(result);
        }
        else {
            var newUser = new User({
                name: profile["_json"]["name"],
                email: profile["_json"]["email"],
                facebookId: profile["_json"]["id"]
            });
            newUser.save(function(err, user) {
                console.log('User created.');
                console.log(user);
            });
        }
    });
  }
));

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['public_profile', 'email'] })
);

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
router.get('/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' }));

module.exports = router;