const
AREAS = ['hilltop', 'odenigwe'],
ROOM_TYPES = ['self con', 'flat'],
CURFEW_TIMES = {
    opens: [
        '03:00 AM',
        '03:30 AM',
        '04:00 AM',
        '04:30 AM',
        '05:00 AM',
        '05:30 AM',
        '06:00 AM',
        '06:30 AM',
        '07:00 AM',
        '07:30 AM',
        '08:00 AM',
    ],
    closes: [
        '08:00 PM',
        '08:30 PM',
        '09:00 PM',
        '09:30 PM',
        '10:00 PM',
        '10:30 PM',
        '11:00 PM',
        '11:30 PM',
        '12:00 PM',
    ]
},
LODGE = {
    bills: [
        'water',
        'electricity'
    ],
    amenities: [
        'water',
        'gated fence'
    ],
    rules: [
        'smoking', 
        'overnight guests', 
        'pets'
    ]
},
ROOM = {
    bedroom: [
        "windows", 
        "wardrobe", 
        "balcony", 
        "electric outlets", 
        "ceiling fan"
    ],
    bathroom: [
        "toilet", 
        "shower", 
        "sink"
    ],
    kitchen: [
        "sink"
    ],
}

module.exports = {
    AREAS, ROOM_TYPES, CURFEW_TIMES, LODGE, ROOM
}