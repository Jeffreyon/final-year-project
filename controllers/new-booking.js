var Room = require("../models/Room.js");
var Booking = require("../models/Booking.js");
var newBookingViewModel = require("../viewModels/new-booking.js");
const config = require("../config.js");
const paystack = require("paystack")(config.paystack.secretKey);
const Lodge = require("../models/Lodge.js");
const { sendNewBookingAlert } = require("../lib/email.js")(config);

function loggedIn(req, res, next) {
    // if user isn't logged in
    if (!req.session.user) {
        return res.redirect(303, "/log-in");
    }
    next();
}

module.exports.controller = (app) => {
    // initialize payment
    app.post("/new-booking/pay", loggedIn, (req, res, next) => {
        // get form data
        var form = {
            email: req.session.user.email,
            fullName: req.session.user.displayName,
        };

        // get room
        Room.findById(req.body.rid, (err, room) => {
            if (err) return next(err);
            if (!room) return next();
            if (!room.isAvailable)
                return res.redirect(303, "/rooms/" + room._id);

            // room is available
            // wrap form metadata
            form.metadata = {
                room: room._id,
                email: req.body.userEmail,
                fullName: req.body.userFullName,
                uid: req.session.user.id,
            };

            // calculate amount
            var fee = config.getFee(room.price);
            form.amount = (room.price + fee) * 100; // amount in kobo

            // initailize payment
            paystack.transaction
                .initialize(form)
                .then((response) => {
                    console.log("hey");
                    // redirect to checkout
                    return res.redirect(302, response.data.authorization_url);
                })
                .catch((err) => {
                    // TODO: Log error
                    return next(err);
                });
        });
    });

    // verify payment and create booking
    app.get("/new-booking/verify", loggedIn, (req, res, next) => {
        var ref = req.query.reference;
        paystack.transaction
            .verify(ref)
            .then((response) => {
                // check for success
                // get transaction metadata
                var body = response.data;
                var data = {
                    reference: body.reference,
                    amount: body.amount,
                    email: body.customer,
                    room: body.metadata.room,
                    userId: body.metadata.uid,
                };
                // get room by metadata.rid
                Room.findById(data.room, (err, room) => {
                    if (err) return next(err);
                    if (!room) return next();

                    // check if it has been booked
                    if (!room.isAvailable)
                        return res.redirect(303, "/rooms/" + room._id);

                    // set room/lodge availability
                    room.isAvailable = false;
                    room.save((err, room) => {
                        if (err) return next(err);

                        // create booking
                        new Booking({
                            imgUrl: room.images[0],
                            roomId: room._id,
                            roomMetadata: {
                                roomType: room.roomType,
                                roomNumber: room.roomNumber,
                                description: room.description,
                                price: room.price,
                                area: room.area,
                            },
                            userId: data.userId,
                            transactionRef: data.reference,
                            amount: data.amount / 100,
                        }).save((err, booking) => {
                            if (err) return next(err);

                            // Send new booking alert
                            Room.findById(booking.roomId)
                                .then(function (room) {
                                    if (!room) return next();
                                    else {
                                        room.getLodgeDetails()
                                            .then(function ({ name }) {
                                                return sendNewBookingAlert(
                                                    name
                                                );
                                            })
                                            .catch(console.error)
                                            .finally(function () {
                                                // redirect to /account/bookings
                                                req.flash(
                                                    "info",
                                                    "Room booked!"
                                                );
                                                return res.redirect(
                                                    303,
                                                    "/account/bookings/" +
                                                        booking._id
                                                );
                                            });
                                    }
                                })
                                .catch(next);
                        });
                    });
                });
            })
            .catch(next);
    });

    // room to book
    app.get("/new-booking(/:room)?", (req, res, next) => {
        if (!req.params.room) return res.redirect(303, "/rooms");
        // if user isn't logged in
        if (!req.session.user) {
            var redirect = encodeURIComponent(
                "/new-booking/" + req.params.room
            );
            return res.redirect(303, "/sign-up?redirect=" + redirect);
        }
        // find room
        Room.findOne({ _id: req.params.room }, (err, room) => {
            if (err) return next(err);

            // if room doesn't exist
            if (!room) return next();
            // if room is unavailable
            else if (!room.isAvailable)
                return res.redirect(303, "/rooms/" + room._id);
            else {
                newBookingViewModel(room)
                    .then(function (context) {
                        context.layout = null;
                        return res.render("new-booking", context);
                    })
                    .catch(next);
            }
        });
    });
};
