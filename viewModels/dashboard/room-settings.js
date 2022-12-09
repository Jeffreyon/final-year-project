var _ = require('lodash');
const { moneyFormat } = require('../../lib/numbFormatter');

module.exports = function(room){
    var roomCopy = _.pick(room, ['_id', 'lodge', 'roomNumber', 'price', 'description', 'imageDir', 'images', 'roomAmenities', 'upstairs', 'isAvailable', 'createdAt']);

    roomCopy.price = moneyFormat.to(room.price);
    roomCopy.heroImage = room.images[0];
    roomCopy.roomAmenities = roomCopy.roomAmenities.map((e) => {
        return {
            roomSection: _.capitalize(e.roomSection),
            amenities: e.amenities
        }
    });

    return roomCopy;
}