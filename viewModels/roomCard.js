var {moneyFormat} = require('../lib/numbFormatter.js');
var _ = require('lodash');

module.exports = async function(rooms){
    return {
        rooms: rooms.filter((room) => {
            return room.images.length > 0;
        }).map(async (room) => {
            return {
                _id: room._id,
                area: _.capitalize(room.area),
                roomType: _.capitalize(room.roomType),
                price: moneyFormat.to(room.price),
                imgUrl: room.images[0],
                hasBills: (_.pick(await room.getLodgeDetails(), ['bills']).bills.length > 0)? true : false,
                beds: room.beds,
                baths: room.baths,
                upstairs: room.upstairs
            };
        })
    }
}