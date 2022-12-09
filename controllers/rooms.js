var Room = require('../models/Room.js');
var roomViewModel = require('../viewModels/room.js');
var roomCardViewModel = require('../viewModels/roomCard.js');
var qs = require('querystring');
var _ = require('lodash');

module.exports.controller = (app) => {
    app.get('/rooms/:id', (req, res, next) => {
        Room.findById(req.params.id, (err, room) => {
            if(err) return next(err);
            if(!room) return next();
            
            // async function returns a promise
            roomViewModel(room).then(function(context){
                res.render('room', context);
            }).catch(function(err){
                next(err);
            })
        });
    });
    
    app.get('/rooms', async (req, res, next) => {
        var filters = _.omit(req.query, ['page']);
        var query = {
            isAvailable: true
        };

        if(filters) {
            // set a prop in query based on the key
            for (const key in filters) {
                if (filters.hasOwnProperty(key)) {
                    if(key === 'minPrice' || key === 'maxPrice') {
                        if(!query.price) query.price = {};
                        if(key === 'minPrice') query.price.$gte = filters[key];
                        if(key === 'maxPrice') query.price.$lte = filters[key];
                    } else if(key === 'upstairs') {
                        query[key] = (filters[key] === 'on')? true : false;
                    } else if(key === 'withoutBills') continue;
                    else query[key] = filters[key];
                }
            }
        }

        var filterOptions = {
            area: filters.area,
            roomType: filters.roomType,
            price: {
                minPrice: filters.minPrice || 110000,
                maxPrice: filters.maxPrice || 290000
            },
            upstairs: (filters.upstairs)? 'checked': '',
            withoutBills: (filters.withoutBills)? 'checked': ''
        };

        const resPerPage = 12; // results per page
        const page = req.query.page || 1; // page
        var roomCount = await Room.countDocuments(query);// number of rooms

        Room.find(query, (err, rooms) => {
            if(err) return next(err);

            roomCardViewModel(rooms).then((context) => {
                Promise.all(context.rooms).then((rooms) => {
                    context.rooms = rooms;
                    if(filters.withoutBills && filters.withoutBills == 'on') {
                        context.rooms = context.rooms.filter((room) => !room.hasBills)
                    }
                    context.filterOptions = filterOptions;
                    context.pageDetails = {
                        roomCount: roomCount,
                        currentCount: context.rooms.length,
                        currentPage: page,
                        pages: Math.ceil(roomCount / resPerPage),
                        querystring: qs.stringify(filters)
                    }
                    res.render('search', context);
                })
            });
        }).skip((resPerPage * page) - resPerPage).limit(resPerPage);
    });
}