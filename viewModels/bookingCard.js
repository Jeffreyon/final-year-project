const {moneyFormat} = require('../lib/numbFormatter.js');
const _ = require('lodash');

module.exports = function(bookings){
    return {
       bookings: bookings.map((booking) => {
           booking.roomMetadata.area = _.capitalize(booking.roomMetadata.area);
           booking.roomMetadata.roomType = _.capitalize(booking.roomMetadata.roomType);
            return {
                _id: booking._id,
                roomId: booking.roomId,
                metadata: booking.roomMetadata,
                displayPrice: moneyFormat.to(booking.roomMetadata.price),
                imgUrl: booking.imgUrl,
                status: booking.status,
                createdAt: booking.createdAt.toDateString()
            }
        })
    }
}