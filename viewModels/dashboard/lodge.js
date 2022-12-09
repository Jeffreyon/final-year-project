const {moneyFormat} = require('../../lib/numbFormatter.js');
const Room = require('../../models/Room.js');
const _ = require('lodash');

module.exports = async function(lodgeDetails){
    var rooms = await Room.find({lodge: lodgeDetails._id});
    var lodge = _.omit(lodgeDetails, ['__v']);
    
    lodge.bills = lodge.bills.map(function(e){
        return {
            bill: e.bill,
            amount: moneyFormat.to(e.amount),
            payEvery: e.payEvery
        }
    });
    lodge.createdAt = lodge.createdAt.toDateString();
    lodge.location.area = _.capitalize(lodge.location.area);

    return {
        lodge: lodge,
        rooms: rooms.sort(function(a, b){
            var dateA = Date.parse(a.createdAt);
            var dateB = Date.parse(b.createdAt);

            if(dateA > dateB) return -1;
            if(dateA < dateB) return 1;
            return 0;
        }).map(function(room){
            return {
                _id: room._id,
                roomNumber: room.roomNumber,
                price: moneyFormat.to(room.price),
                imgUrl: room.images[0],
                isAvailable: room.isAvailable,
                createdAt: room.createdAt
            }
        })
    }
}