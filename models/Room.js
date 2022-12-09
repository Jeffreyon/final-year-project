var mongoose = require('mongoose');
const Lodge = require('./Lodge.js');

var roomSchema = mongoose.Schema({
    lodge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lodge"
    },
    roomNumber: Number,
    area: String,
    city: String,
    roomType: String,
    price: Number,
    description: String,
    images: [],
    beds: Number,
    baths: Number,
    upstairs: {
        type: Boolean,
        default: false
    },
    roomAmenities: [],
    isAvailable: {
        type: Boolean,
        default: true
    },
    createdAt: { 
        type: Date,
        required: true,
        default: Date.now
    }
});

roomSchema.methods.getLodgeDetails = async function(){
    var lodge = await Lodge.findById(this.lodge);
    
    return {
        name: lodge.name,
        landlord: lodge.landlord,
        bills: lodge.bills,
        amenities: lodge.amenities,
        rules: lodge.rules,
        curfew: lodge.curfew,
        location: lodge.location
    }
};

var Room = mongoose.model('Room', roomSchema);
module.exports = Room;