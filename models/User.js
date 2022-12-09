const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
var Booking = require('./Booking.js');

var userSchema = mongoose.Schema({
    name: {
        first: String,
        last: String
    },
    displayName: String,
    email: String,
    password: String,
    phoneNumber: String,
    role: String,
    isVerified: {type: Boolean, default: false},
    bookings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking'
        }
    ],
    createdAt: { 
        type: Date,
        required: true,
        default: Date.now
    }
});

userSchema.methods.getAllBookings = async function(){
    var bookings = await Booking.find({userId: this._id});
    return bookings;
}
userSchema.methods.getBooking = async function(bookingId){
    var query = {
        _id: bookingId,
        userId: this._id
    }
    var booking = await Booking.findOne(query);
    return booking;
}

var User = mongoose.model('User', userSchema);
module.exports = User;

module.exports.createUser = function(newUser, cb) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (error, hash) => {
            const newUserResource = newUser;
            newUserResource.password = hash;
            return newUserResource.save(cb);
        });
    });
};

module.exports.comparePassword = (password, hash, cb) => {
    bcrypt.compare(password, hash, (err, isMatch) => {
        if (err) throw err;
        return cb(null, isMatch);
    });
};

module.exports.changeUserPassword = (user, newPassword, cb) => {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newPassword, salt, (error, hash) => {
            user.password = hash;
            return user.save(cb);
        });
    });
};