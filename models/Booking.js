var mongoose = require('mongoose');

// TODO: Modularize this variable as a token
const BOOKING_STATUS = {
    CANCELLED: "cancelled",
    PENDING: "pending",
    CONFIRMED: "confirmed"
}

var bookingSchema = mongoose.Schema({
    imgUrl: String,
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
    },
    roomMetadata: {
        roomType: String,
        roomNumber: Number,
        description: String,
        price: Number,
        area: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    transactionRef: String,
    amount: Number,
    status: {
        type: String,
        default: BOOKING_STATUS.PENDING
    },
    createdAt: { 
        type: Date,
        required: true,
        default: Date.now
    }
});

var Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
module.exports.BOOKING_STATUS = BOOKING_STATUS;