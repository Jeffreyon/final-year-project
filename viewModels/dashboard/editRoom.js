const _ = require('lodash');
var {ROOM} = require('../../lib/form-data.js');

module.exports = function(room){
    var room = _.pick(room, ['_id', 'lodge', 'roomNumber', 'price', 'description', 'imageDir', 'images', 'roomAmenities']);

    function mapRoomAmenities(section){
        // get section
        var roomSection = room.roomAmenities.find(function(item){
            return item.roomSection === section
        })

        if (roomSection) {
            // generate amenities item list
            var amenitiesItemList = roomSection.amenities.map(function (amenity) {
                // amenity items
                return ROOM[section].map(function (amenityItem) {
                    return {
                        amenityItem,
                        selected: (amenityItem == amenity) ? "selected" : ''
                    }
                })
            })

            return amenitiesItemList;
        } else return;
    }

    room.roomAmenities = room.roomAmenities.map(function(section){
        var amenities = mapRoomAmenities(section.roomSection);
        console.log(amenities)
        var roomSection = section.roomSection
        return {
            roomSection, amenities
        }
    })

    return {
        room
    }
}