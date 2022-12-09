const {moneyFormat} = require('../lib/numbFormatter.js');
const config = require('../config.js');
const _ = require('lodash');


module.exports = async function(room) {
    var lodgeDetails = await room.getLodgeDetails();
    var fee = config.getFee(room.price);

    return {
        rid: room._id,
        roomType: _.capitalize(room.roomType),
        area: _.capitalize(room.area),
        displayRent: moneyFormat.to(room.price),
        displayFee: moneyFormat.to(fee),
        displayTotal:  moneyFormat.to(room.price + fee),
        description: room.description,
        imgUrl: room.images[0],
        beds: room.beds,
        baths: room.baths,
        lodge: {
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