var mongoose = require('mongoose');

var lodgeSchema = mongoose.Schema({
    name: String,
    roomType: String,
    roomCount: {
        type: Number,
        default: 0
    },
    beds: Number,
    baths: Number,
    withKitchen: {
        type: Boolean,
        default: false
    },
    landlord: {
        name: String,
        phone: String
    },
    bills: [],
    amenities: [],
    rules: [],
    curfew: {
        opens: String,
        closes: String
    },
    location: {
        area: String,
        city: {
            type: String,
            default: "nsukka"
        },
        state: {
            type: String,
            default: "enugu"
        },
        geocode: {
            lat: Number,
            lng: Number
        }
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});

lodgeSchema.methods.getAddress = function(lineDelim){
    if(!lineDelim) lineDelim = ' ';
    var address = this.location.address;
    var addr = address.area;
    addr += lineDelim + address.city;
    addr += lineDelim + address.state;

    return addr;
}

var Lodge = mongoose.model('Lodge', lodgeSchema);
module.exports = Lodge;