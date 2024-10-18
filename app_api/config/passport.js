const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Users = require('../models/user');
const User = mongoose.model('users');

passport.use(
    new LocalStrategy(
        {
            usernameField: 'email'
        },
        async (username, password, done) => {
            const q = await User.findOne({ email: username}).exec();
            // If the database returned no record, the user doesn't exist.
            if (!q) {
                return done(null, false, {
                    message: "Incorrect Username.",
                });
            }
            // Validate user password.
            if (!q.validPassword(password)) {
                return done(null, false, {
                    message: "Incorrect Password.",
            });
        }
        // Everything is OK, return to the user object.
        return done(null, q);
        }
    )
);