var {moneyFormat} = require('../lib/numbFormatter.js');
var _ = require('lodash');

module.exports = async function (room) {
    var lodgeDetails = await room.getLodgeDetails();
    
    return {
        _id: room._id,
        roomType: _.capitalize(room.roomType),
        area: _.capitalize(room.area),
        city: _.capitalize(room.city),
        price: moneyFormat.to(room.price),
        description: room.description,
        images: room.images,
        heroImage: room.images[0],
        beds: room.beds,
        baths: room.baths,
        upstairs: room.upstairs,
        roomAmenities: room.roomAmenities.map((e) => {
            return {
                roomSection: _.capitalize(e.roomSection),
                amenities: e.amenities
            }
        }),
        isAvailable: room.isAvailable,
        lodge: {
            amenities: lodgeDetails.amenities,
            rules: lodgeDetails.rules,
            curfew: lodgeDetails.curfew,
            bills: lodgeDetails.bills.map((e) => {
                return {
                    bill: e.bill,
                    amount: moneyFormat.to(e.amount),
                    payEvery: e.payEvery
                }
            })
        }
    }
}