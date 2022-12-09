var User = require('../models/User.js');
var bookingCardViewModel = require('../viewModels/bookingCard.js');
var userViewModel = require('../viewModels/user.js');


function loggedIn(req, res, next) {
    if (!req.session.user) return res.redirect(303, '/log-in');
    next();
}

module.exports.controller = (app) => {
    app.get('/account', loggedIn, function (req, res, next) {
        User.findById(req.session.user.id, (err, user) => {
            if(err) return next(err);
            if(!user) return next();

            userViewModel(user).then(function(context){
                context.messages = req.flash('info');
                return res.render('account/profile', context);
            }).catch(next);
        });
    });
    
    app.get('/account/bookings', loggedIn, function (req, res, next) {

        User.findById(req.session.user.id, (err, user) => {
            if(err) return next(err);
            if(!user) return next();

            user.getAllBookings().then(bookings => {
                // transform the list with its view model
                var context = bookingCardViewModel(bookings);

                // serve the booking page
                context.messages = req.flash('info');
                return res.render('account/bookings', context);
            }).catch(next);
        })
    });


    // CHANGE PASSWORD POST

    app.post('/account/change-password', loggedIn, function(req, res, next){
        var oldPassword = req.body.oldPassword || '', newPassword = req.body.newPassword || '';

        // validate password fields
        if(!oldPassword || !newPassword) {
            req.flash('info', 'Complete the password fields');
            return res.redirect(303, '/account');
        }

        //Find user
        User.findById(req.session.user.id, (err, user) => {
            if(err) return next(err);
            if(!user) return next();

            // if user exists compare old password with user password
            User.comparePassword(oldPassword, user.password, (err, isMatch) => {
                if(err) return next(err);

                if(!isMatch) {
                    req.flash('info', 'Your old password is incorrect');
                    return res.redirect(303, '/account');
                }
                // if password matches
                else {
                    // change user password
                    User.changeUserPassword(user, newPassword, function(err, user){
                        if(err) return next(err);

                        req.flash('info', 'Your new password has been set');
                        return res.redirect(303, '/account');
                    })
                }
            })
        })
    });
}