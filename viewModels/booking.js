const { moneyFormat } = require('../lib/numbFormatter.js');
const _ = require('lodash');
const Room = require('../models/Room.js');

module.exports = async function (booking) {
    var room = await Room.findById(booking.roomId)
    if (room) {
        var lodgeDetails = _.pick(await room.getLodgeDetails(), ['name', 'landlord', 'location']);

        booking.roomMetadata.area = _.capitalize(booking.roomMetadata.area);
        booking.roomMetadata.roomType = _.capitalize(booking.roomMetadata.roomType);

        return {
            lodgeDetails: lodgeDetails,
            _id: booking._id,
            roomId: booking.roomId,
            metadata: booking.roomMetadata,
            txnRef: booking.transactionRef,
            displayPrice: moneyFormat.to(booking.roomMetadata.price),
            imgUrl: booking.imgUrl,
            status: booking.status,
            createdAt: booking.createdAt.toDateString()
        }
    }

    return;
}