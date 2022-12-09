const Booking = require('../models/Booking.js');
const bookingViewModel = require('../viewModels/booking.js')
const Room = require('../models/Room.js');
const User = require('../models/User.js');
const Lodge = require('../models/Lodge.js');
const {sendBookingConfirmationAlert, sendBookingCancelledAlert} = require('../lib/email.js')(require('../config.js'))

function loggedIn(req, res, next) {
    if (!req.session.user) return res.redirect(303, '/log-in');
    next();
}


module.exports.controller = function (app) {
    app.get('/account/bookings/:bookingId', loggedIn, function (req, res, next) {
        // look for booking by id
        Booking.findById(req.params.bookingId, (err, booking) => {
            if (err) return next(err);
            if (!booking) return next();

            bookingViewModel(booking).then(function (context) {
                if (!context) return next();
                // serve the booking
                context.messages = req.flash('info');
                return res.render('account/booking-details', context);
            }).catch(next);

        });
    });

    app.post('/account/bookings/:bookingId/cancel', loggedIn, function (req, res, next) {
        const bid = req.body.bid, userPassword = req.body.password;

        // Get user
        User.findById(req.session.user.id, function (err, user) {
            if (err) return next(err);
            if (!user) return next();

            // Validate password
            User.comparePassword(userPassword, user.password, (err, isMatch) => {
                if (err) return next(err);

                if (!isMatch) {
                    req.flash('info', 'Your account password is incorrect');
                    return res.redirect(303, '/account/bookings/' + req.params.bookingId);
                }

                // Get booking
                user.getBooking(bid).then((booking) => {
                    if (!booking) return next();

                    // Check if booking status is "pending"
                    if (booking.status === Booking.BOOKING_STATUS.PENDING) {
                        // Set status appropriately
                        booking.status = Booking.BOOKING_STATUS.CANCELLED;
                        booking.save((err, booking) => {
                            if (err) return next(err);
                            if (!booking) return next();

                            // if cancelled, Get and make room available
                            Room.findById(booking.roomId, (err, room) => {
                                if (err) return next(err);
                                if (!room) return next();

                                room.isAvailable = true;
                                room.save((err, room) => {
                                    if (err) return next(err);
                                    if (!room) return next();

                                    room.getLodgeDetails()
                                    .then(function ({ name }) {
                                        return sendBookingCancelledAlert(name)
                                    })
                                    .catch(console.error)
                                    .finally(function () {
                                        // redirect to /account/bookings
                                        req.flash('info', 'You have cancelled your booking');
                                        return res.redirect(303, '/account/bookings/' + req.params.bookingId);
                                    })
                                })
                            });
                        });
                    } else {
                        req.flash('info', 'This booking has already been ' + booking.status);
                        return res.redirect(303, '/account/bookings/' + req.params.bookingId);
                    }
                }).catch(next);
            });
        });
    });

    app.post('/account/bookings/:bookingId/confirm', loggedIn, function (req, res, next) {
        const bid = req.body.bid, userPassword = req.body.password;

        // Get user
        User.findById(req.session.user.id, function (err, user) {
            if (err) return next(err);
            if (!user) return next();

            // Validate password
            User.comparePassword(userPassword, user.password, (err, isMatch) => {
                if (err) return next(err);

                if (!isMatch) {
                    req.flash('info', 'Your account password is incorrect');
                    return res.redirect(303, '/account/bookings/' + req.params.bookingId);
                }

                // Get booking
                user.getBooking(bid).then((booking) => {
                    if (!booking) return next();

                    // Check if booking status is "pending"
                    if (booking.status === Booking.BOOKING_STATUS.PENDING) {
                        // Set status appropriately
                        booking.status = Booking.BOOKING_STATUS.CONFIRMED;
                        booking.save((err, booking) => {
                            if (err) return next(err);
                            if (!booking) return next();

                            // Notify about confirmation
                            Room.findById(booking.roomId, (err, room) => {
                                if (err) return next(err);
                                if (!room) return next();

                                room.getLodgeDetails()
                                .then(function ({ name }) {
                                    return sendBookingConfirmationAlert(name)
                                })
                                .catch(console.error)
                                .finally(function () {
                                    // redirect to /account/bookings
                                    req.flash('info', 'You have confirmed your booking');
                                    return res.redirect(303, '/account/bookings/' + req.params.bookingId);
                                })
                            });
                        });
                    } else {
                        req.flash('info', 'This booking has already been ' + booking.status);
                        return res.redirect(303, '/account/bookings/' + req.params.bookingId);
                    }
                }).catch(next);
            });
        });
    })
}