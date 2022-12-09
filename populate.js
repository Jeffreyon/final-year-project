var Room = require("./models/Room.js");
var Lodge = require("./models/Lodge.js");
var {
    ROOM_TYPES,
    AREAS,
    ROOM,
    LODGE,
    CURFEW_TIMES,
} = require("./lib/form-data.js");

const refreshLodgeCount = async function (lodgeId) {
    return await Lodge.findById(lodgeId)
        .then(async (lodge) => {
            var roomCount = await Room.countDocuments({ lodge: lodgeId });
            lodge.roomCount = roomCount;
            lodge.save();
        })
        .catch(console.log);
};

function getDevRoomImages() {
    var images = [
        "https://source.unsplash.com/mw_mj-noYHM",
        "https://source.unsplash.com/wot0Q5sg91E",
        "https://source.unsplash.com/7jOeRc0dOWs",
        "https://source.unsplash.com/Z3uSM5GVpFc",
        "https://source.unsplash.com/mweDhudGmIc",
    ];

    return images.sort(() => Math.random() - 0.5);
}

const createRoom = function (lodge, roomNumber) {
    // create room
    return new Room({
        lodge: lodge._id,
        roomNumber: roomNumber,
        area: lodge.location.area,
        city: lodge.location.city,
        roomType: lodge.roomType,
        price: 120000,
        description: "Ambient room with windows",
        images: getDevRoomImages(),
        beds: lodge.beds,
        baths: lodge.baths,
        upstairs: Math.random() > 0.5,
        roomAmenities: [
            {
                roomSection: "bedroom",
                amenities: ROOM.bedroom,
            },
            {
                roomSection: "bathroom",
                amenities: ROOM.bathroom,
            },
            {
                roomSection: "kitchen",
                amenities: ROOM.kitchen,
            },
        ],
    }).save((err, room) => {
        if (err) return console.log(err);

        return refreshLodgeCount(room.lodge);
    });
};

const createLodge = function () {
    Lodge.find((err, lodges) => {
        if (lodges.length) return console.log("DB populated");

        new Lodge({
            name: "Great Divine Lodge",
            roomType: ROOM_TYPES[0],
            beds: 1,
            baths: 1,
            withKitchen: true,
            landlord: {
                name: "Ekene Richard",
                phone: "08085709543",
            },
            bills: [
                {
                    bill: LODGE.bills[0],
                    amount: 1500,
                    payEvery: "mo",
                },
                {
                    bill: LODGE.bills[1],
                    amount: 1000,
                    payEvery: "mo",
                },
            ],
            amenities: LODGE.amenities,
            rules: [
                {
                    rule: LODGE.rules[0],
                    allowed: false,
                },
                {
                    rule: LODGE.rules[1],
                    allowed: false,
                },
                {
                    rule: LODGE.rules[2],
                    allowed: true,
                },
            ],
            curfew: {
                opens: CURFEW_TIMES.opens[3],
                closes: CURFEW_TIMES.closes[4],
            },
            location: {
                area: AREAS[0],
                geocode: {
                    lat: 12.3304,
                    lng: 10.002,
                },
            },
        }).save((err, lodge) => {
            if (err) return console.log(err);

            var promises = [];
            for (var num = 1; num <= 50; num++) {
                promises.push(createRoom(lodge, num));
            }
            Promise.all(promises)
                .then(() =>
                    console.log(
                        "Created and populated: " +
                            lodge.name +
                            " with " +
                            promises.length +
                            " rooms"
                    )
                )
                .catch((reason) =>
                    console.log("Could not complete populating: " + reason)
                );
        });

        new Lodge({
            name: "Dignity Lodge",
            roomType: ROOM_TYPES[1],
            beds: 2,
            baths: 1,
            withKitchen: true,
            landlord: {
                name: "Martins odu",
                phone: "08085709543",
            },
            bills: [
                {
                    bill: LODGE.bills[0],
                    amount: 1500,
                    payEvery: "mo",
                },
            ],
            amenities: LODGE.amenities,
            rules: [
                {
                    rule: LODGE.rules[1],
                    allowed: true,
                },
                {
                    rule: LODGE.rules[2],
                    allowed: false,
                },
            ],
            curfew: {
                opens: CURFEW_TIMES.opens[4],
                closes: CURFEW_TIMES.closes[6],
            },
            location: {
                area: AREAS[1],
                geocode: {
                    lat: 12.3304,
                    lng: 10.002,
                },
            },
        }).save((err, lodge) => {
            if (err) return console.log(err);

            var promises = [];
            for (var num = 1; num <= 50; num++) {
                promises.push(createRoom(lodge, num));
            }
            Promise.all(promises)
                .then(() =>
                    console.log(
                        "Created and populated: " +
                            lodge.name +
                            " with " +
                            promises.length +
                            " rooms"
                    )
                )
                .catch((reason) =>
                    console.log("Could not complete populating: " + reason)
                );
        });
    });
};

module.exports.run = function () {
    createLodge();
};
