const Lodge = require('../models/Lodge.js');
const Room = require('../models/Room.js');
const lodgesViewModel = require('../viewModels/dashboard/lodges.js');
const lodgeViewModel = require('../viewModels/dashboard/lodge.js');
const addRoomViewModel = require('../viewModels/dashboard/addRoom.js');
const editLodgeViewModel = require('../viewModels/dashboard/editLodge.js');
const editRoomViewModel = require('../viewModels/dashboard/editRoom.js');
const roomSettingsViewModel = require('../viewModels/dashboard/room-settings.js');
const { validate, validationResult } = require('../lib/validator.js')('dashboard');
const config = require('../config.js');
const {fileUploader, uploadToCloud} = require('../lib/image-uploader');

function loggedIn(req, res, next) {
    if(config.env === 'production') {
        if (!req.session.user) return next('route');
    }
    next();
}
function isMaster(req, res, next) {
    if(config.env === 'production') {
        if(req.session.user.email !== config.admin) return next('route');
    }
    next(); 
}

module.exports.controller = (app) => {
    app.get('/dashboard', loggedIn, isMaster, function(req, res, next){
        return res.render('dashboard/index', {layout: 'dashboard', messages: req.flash('info')});
    });

    // ADD LODGE OR ROOM
    app.get('/dashboard/add-lodge', loggedIn, isMaster, function(req, res, next){
        return res.render('dashboard/add-lodge', {layout: 'dashboard', messages: req.flash('info')});
    });
    app.post('/dashboard/add-lodge', loggedIn, isMaster, validate('add-lodge'), function(req, res, next){
        // check if validation passed
        let errors = validationResult(req).errors;
        if(errors.length) {
            req.flash('info', "Add Lodge validation failed: " + JSON.stringify(errors));
            return  res.redirect(303, '/dashboard');
        }

        // prepare properties
        var newLodge = {};

        newLodge.name = req.body.lodgeName;
        newLodge.roomType = req.body.roomType;
        newLodge.beds = Number(req.body.beds), newLodge.baths = Number(req.body.baths);
        newLodge.landlord = {
            name: req.body.landlordName,
            phone: req.body.landlordPhone
        }
        newLodge.curfew = {
            opens: req.body.curfewOpens,
            closes: req.body.curfewCloses,
        }
        newLodge.location = {
            area: req.body.area,
            geocode: {
                lat: req.body.geocodeLat,
                lng: req.body.geocodeLong
            }
        }

        // with kitchen?
        if(req.body.withKitchen === "true") newLodge.withKitchen = true;

        // with bills?
        if (req.body.withBills === "on") {
            if (Array.isArray(req.body.bills)) {
                newLodge.bills = [];
                if (req.body.bills.join("") !== "") {
                    for (var x = 0; x < req.body.bills.length; x++) {
                        if (req.body.bills[x] == "") continue;

                        newLodge.bills.push({
                            bill: req.body.bills[x],
                            amount: Number(req.body.billAmounts[x]),
                            payEvery: req.body.billTypes[x]
                        })
                    }
                }
            } else {
                newLodge.bills = [
                    {
                        bill: req.body.bills,
                        amount: Number(req.body.billAmounts),
                        payEvery: req.body.billTypes
                    }
                ]
            }
        }
        
        // with amenities
        if (req.body.withAmenities === "on") {
            if (Array.isArray(req.body.amenities)) {
                newLodge.amenities = [];
                if (req.body.amenities.join("") !== "") {
                    for (var x = 0; x < req.body.amenities.length; x++) {
                        if (req.body.amenities[x] == "") continue;

                        newLodge.amenities.push(req.body.amenities[x]);
                    }
                }
            } else {
                newLodge.amenities = [req.body.amenities];
            }
        }

        // with rules?
        if (req.body.withRules === "on") {
            if (Array.isArray(req.body.rules)) {
                newLodge.rules = [];
                if (req.body.rules.join("") !== "") {
                    for (var x = 0; x < req.body.rules.length; x++) {
                        if (req.body.rules[x] == "") continue;

                        var rule = {
                            rule: req.body.rules[x]
                        };
                        if(req.body.rulesAllowed[x] === "true") rule.allowed = true;
                        else rule.allowed = false;
                        newLodge.rules.push(rule);
                    }
                }
            } else {
                var rule = {
                    rule: req.body.rules
                };
                if(req.body.rulesAllowed === "true") rule.allowed = true;
                else rule.allowed = false;

                newLodge.rules = [rule];
            }
        }

        // create lodge
        new Lodge(newLodge).save(function(err, lodge){
            if(err) next(err)

            req.flash('info', lodge.name + " created");
            return  res.redirect(303, '/dashboard/lodges/' + lodge._id);
        })
    });
    app.get('/dashboard/add-room', loggedIn, isMaster, function(req, res, next){
        Lodge.find(function(err, lodges){
            if(err) return next(err);

            var context = lodgesViewModel(lodges)
            context.layout = 'dashboard'
            context.messages = req.flash('info');
            
            res.render('dashboard/add-room', context);
        });
    });
    app.get('/dashboard/add-room/:lodgeId', loggedIn, isMaster, function(req, res, next){
        // find lodge
        Lodge.findById(req.params.lodgeId, function(err, lodge){
            if(err) return next(err);
            if(!lodge) return next();

            var context = addRoomViewModel(lodge);
            context.layout = 'dashboard';
            context.messages = req.flash('info');
            res.render('dashboard/add-room-form', context);
        });
    });
    app.post('/dashboard/add-room', loggedIn, isMaster,  fileUploader.array('room-images'), validate('add-room'), function(req, res, next){

        // check if validation passed
        let errors = validationResult(req).errors;
        if(errors.length) {
            req.flash('info', "Add Room validation failed: " + JSON.stringify(errors));
            return  res.redirect(303, '/dashboard');
        }

        const refreshLodgeCount = async function(lodgeId){
            return await Lodge.findById(lodgeId).then(async (lodge) => {
                var roomCount = await Room.countDocuments({lodge: lodgeId});
                lodge.roomCount = roomCount;
                return lodge.save();
            }).catch(next);
        };
        
        Room.findOne({lodge: req.body.lodgeId, roomNumber: Number(req.body.roomNumber)}, function(err, room){
            if(err) return next(err);
            if(room){
                req.flash('info', "Room " + room.roomNumber + " already exists in this lodge");
                return res.redirect(303, '/dashboard/add-room/' + req.body.lodgeId);
            }
            else {
                Lodge.findById(req.body.lodgeId, (err, lodge) => {
                    if(err) return next(err);
                    if(!lodge) return next();
        
                    // upload files to cloud
                    var uploadFolder = `${lodge._id}`;
                    var imgUrlList = [];

                    uploadToCloud(req.files, uploadFolder).then(function (uploadedFiles) {
                        imgUrlList = uploadedFiles.map(file => file.secure_url)

                        var newRoom = {
                            lodge: lodge._id,
                            roomNumber: Number(req.body.roomNumber),
                            area: lodge.location.area,
                            city: lodge.location.city,
                            roomType: lodge.roomType,
                            price: Number(req.body.price),
                            description: req.body.description,
                            images: imgUrlList,
                            beds: lodge.beds,
                            baths: lodge.baths,
                            upstairs: (req.body.upstairs)? true : false,
                            roomAmenities: [],
                            hasBills: (lodge.bills.length)? true : false,
                        };
            
                        // bedroom amenities
                        if(Array.isArray(req.body.bedroomAmenities)) {
                            if(req.body.bedroomAmenities.join("") !== ""){
                                newRoom.roomAmenities.push({
                                    roomSection: 'bedroom',
                                    amenities: req.body.bedroomAmenities.map(function(e){
                                        if(e == "") return;
                                        return e;
                                    })
                                })
                            }
                        } else {
                            newRoom.roomAmenities.push({
                                roomSection: 'bedroom',
                                amenities: [req.body.bedroomAmenities]
                            })
                        }
            
                        // bathroom amenities
                        if(Array.isArray(req.body.bathroomAmenities)) {
                            if(req.body.bathroomAmenities.join("") !== ""){
                                newRoom.roomAmenities.push({
                                    roomSection: 'bathroom',
                                    amenities: req.body.bathroomAmenities.map(function(e){
                                        if(e == "") return;
                                        return e;
                                    })
                                })
                            }
                        } else {
                            newRoom.roomAmenities.push({
                                roomSection: 'bathroom',
                                amenities: [req.body.bathroomAmenities]
                            })
                        }
            
                        // kitchen amenities
                        if(req.body.kitchenAmenities){
                            if(Array.isArray(req.body.kitchenAmenities)) {
                                if(req.body.kitchenAmenities.join("") !== ""){
                                    newRoom.roomAmenities.push({
                                        roomSection: 'kitchen',
                                        amenities: req.body.kitchenAmenities.map(function(e){
                                            if(e == "") return;
                                            return e;
                                        })
                                    })
                                }
                            } else {
                                newRoom.roomAmenities.push({
                                    roomSection: 'kitchen',
                                    amenities: [req.body.kitchenAmenities]
                                })
                            }
                        }
                        
                        new Room(newRoom).save(function(err, room){
                            if(err) next(err);
                            
                            refreshLodgeCount(room.lodge).then((lodge) => {
                                req.flash('info', "Room " + room.roomNumber + " added to " + lodge.name + ".");
                                return res.redirect(303, '/dashboard/lodges/' + lodge._id);
                            });
                        })
                    }).catch(function (err) {
                        if (err) {
                            req.flash('info', "Image upload failed: " + JSON.stringify(err));
                            return res.redirect(303, '/dashboard/add-room/' + lodge._id);
                        }
                    })
                })
            }
        })
    });

    // EDIT LODGE OR ROOM
    app.get('/dashboard/lodges/:lodgeId/edit', loggedIn, isMaster, function(req, res, next){
        // get lodge
        Lodge.findById(req.params.lodgeId, function(err, lodge){
            if(err) return next(err);
            if(!lodge) return next();

            // construct viewModel
            var context = editLodgeViewModel(lodge);
            context.layout = 'dashboard';
            context.messages = req.flash('info');

            // serve edit page
            return res.render('dashboard/edit-lodge', context);
        });
    });
    app.post('/dashboard/edit-lodge', loggedIn, isMaster, validate('edit-lodge'), function(req, res, next){
        // check if validation passed
        let errors = validationResult(req).errors;
        if(errors.length) {
            req.flash('info', "Edit Lodge validation failed: " + JSON.stringify(errors));
            return  res.redirect(303, '/dashboard');
        }

        var newLodge = {};

        newLodge.name = req.body.lodgeName;
        newLodge.landlord = {
            name: req.body.landlordName,
            phone: req.body.landlordPhone
        }
        newLodge.curfew = {
            opens: req.body.curfewOpens,
            closes: req.body.curfewCloses,
        }

        newLodge.bills = [];
        // with bills?
        if (req.body.withBills === "on") {
            if (Array.isArray(req.body.bills)) {
                if (req.body.bills.join("") !== "") {
                    for (var x = 0; x < req.body.bills.length; x++) {
                        if (req.body.bills[x] == "") continue;

                        newLodge.bills.push({
                            bill: req.body.bills[x],
                            amount: Number(req.body.billAmounts[x]),
                            payEvery: req.body.billTypes[x]
                        })
                    }
                }
            } else {
                newLodge.bills = [
                    {
                        bill: req.body.bills,
                        amount: Number(req.body.billAmounts),
                        payEvery: req.body.billTypes
                    }
                ]
            }
        }
        
        newLodge.amenities = [];
        // with amenities
        if (req.body.withAmenities === "on") {
            if (Array.isArray(req.body.amenities)) {
                if (req.body.amenities.join("") !== "") {
                    for (var x = 0; x < req.body.amenities.length; x++) {
                        if (req.body.amenities[x] == "") continue;

                        newLodge.amenities.push(req.body.amenities[x]);
                    }
                }
            } else {
                newLodge.amenities = [req.body.amenities];
            }
        }

        newLodge.rules = [];
        // with rules?
        if (req.body.withRules === "on") {
            if (Array.isArray(req.body.rules)) {
                if (req.body.rules.join("") !== "") {
                    for (var x = 0; x < req.body.rules.length; x++) {
                        if (req.body.rules[x] == "") continue;

                        var rule = {
                            rule: req.body.rules[x]
                        };
                        if(req.body.rulesAllowed[x] === "true") rule.allowed = true;
                        else rule.allowed = false;
                        newLodge.rules.push(rule);
                    }
                }
            } else {
                var rule = {
                    rule: req.body.rules
                };
                if(req.body.rulesAllowed === "true") rule.allowed = true;
                else rule.allowed = false;

                newLodge.rules = [rule];
            }
        }

        Lodge.findById(req.body.lodgeId, function(err, lodge){
            if(err) return next(err);
            if(!lodge) return next();

            lodge.name = newLodge.name;
            lodge.landlord = newLodge.landlord;
            lodge.curfew = newLodge.curfew;
            lodge.bills = newLodge.bills;
            lodge.amenities = newLodge.amenities;
            lodge.rules = newLodge.rules;

            lodge.save(function(err, lodge){
                if(err) return next(err);
                if(!lodge) return next();

                req.flash('info', lodge.name + " updated");
                return res.redirect(303, '/dashboard/lodges/' + lodge._id);
            })
        });
    });
    app.get('/dashboard/lodges/:lodgeId/:roomId/edit', loggedIn, isMaster, function(req, res, next){
        // only available rooms
        Room.findById(req.params.roomId, function(err, room){
            if(err) return next(err);
            if(!room) return next();

            if(!room.isAvailable) {
                req.flash('info', "Room booked, cannot modify");
                return res.redirect(303, `/dashboard/lodges/${req.params.lodgeId}/${room._id}`);
            }

            var context = editRoomViewModel(room);
            context.layout = 'dashboard';

            return res.render('dashboard/edit-room', context);
        })
    });
    app.post('/dashboard/edit-room', loggedIn, isMaster, validate('edit-room'), function(req, res, next){
        // check if validation passed
        let errors = validationResult(req).errors;
        if(errors.length) {
            req.flash('info', "Edit Room validation failed: " + JSON.stringify(errors));
            return  res.redirect(303, '/dashboard');
        }

        var newRoom = {
            price: Number(req.body.price),
            description: req.body.description,
            roomAmenities: []
        };
        
        // bedroom amenities
        if(Array.isArray(req.body.bedroomAmenities)) {
            if(req.body.bedroomAmenities.join("") !== ""){
                newRoom.roomAmenities.push({
                    roomSection: 'bedroom',
                    amenities: req.body.bedroomAmenities.map(function(e){
                        if(e == "") return;
                        return e;
                    })
                })
            }
        } else {
            newRoom.roomAmenities.push({
                roomSection: 'bedroom',
                amenities: [req.body.bedroomAmenities]
            })
        }

        // bathroom amenities
        if(Array.isArray(req.body.bathroomAmenities)) {
            if(req.body.bathroomAmenities.join("") !== ""){
                newRoom.roomAmenities.push({
                    roomSection: 'bathroom',
                    amenities: req.body.bathroomAmenities.map(function(e){
                        if(e == "") return;
                        return e;
                    })
                })
            }
        } else {
            newRoom.roomAmenities.push({
                roomSection: 'bathroom',
                amenities: [req.body.bathroomAmenities]
            })
        }

        // kitchen amenities
        if(req.body.kitchenAmenities){
            if(Array.isArray(req.body.kitchenAmenities)) {
                if(req.body.kitchenAmenities.join("") !== ""){
                    newRoom.roomAmenities.push({
                        roomSection: 'kitchen',
                        amenities: req.body.kitchenAmenities.map(function(e){
                            if(e == "") return;
                            return e;
                        })
                    })
                }
            } else {
                newRoom.roomAmenities.push({
                    roomSection: 'kitchen',
                    amenities: [req.body.kitchenAmenities]
                })
            }
        }

        Room.findById(req.body.roomId, function(err, room){
            if(err) return next(err);
            if(!room) return next();

            if(!room.isAvailable) {
                req.flash('info', "Room booked, cannot modify");
                return res.redirect(303, `/dashboard/lodges/${req.body.lodge}/${req.body.roomId}`);
            }

            room.price = newRoom.price;
            room.description = newRoom.description;
            room.roomAmenities = newRoom.roomAmenities;

            room.save(function(err, room){
                if(err) return next(err);
                if(!room) return next();

                req.flash('info', "Room updated!");
                return res.redirect(303, `/dashboard/lodges/${req.body.lodge}/${room._id}`);
            })
        });
    });

    // VIEW LODGE OR ROOM
    app.get('/dashboard/lodges', loggedIn, isMaster, function(req, res, next){
        Lodge.find(function(err, lodges){
            if(err) return next(err);

            var context = lodgesViewModel(lodges)
            context.layout = 'dashboard'
            context.messages = req.flash('info');

            return res.render('dashboard/lodges', context);
        });
    });
    app.get('/dashboard/lodges/:lodgeId', loggedIn, isMaster, async function(req, res, next){
        // find lodge
        Lodge.findById(req.params.lodgeId, (err, lodge) => {
            if(err) return next(err);
            if(!lodge) return next();

            lodgeViewModel(lodge).then(function(context){
                context.layout = 'dashboard';
                context.messages = req.flash('info');

                return res.render('dashboard/lodge-details', context);
            })
        })
    });
    app.get('/dashboard/lodges/:lodgeId/:roomId', loggedIn, isMaster, function(req, res, next){
       Lodge.findById(req.params.lodgeId, function(err, lodge){
           if(err) return next(err);
           if(!lodge) return next();

           var context = {
               layout: 'dashboard',
               lodgeName: lodge.name
           };

           Room.findById(req.params.roomId, function(err, room){
                if(err) return next(err);
                if(!room) return next();

                context.room = roomSettingsViewModel(room);
                context.messages = req.flash('info');
                if(req.query['modal']) context[req.query.modal] = true;
                return res.render('dashboard/room-settings', context);
           })
       }) 
    });

    // DELETE ROOM
    app.post('/dashboard/delete-room', loggedIn, isMaster, validate('delete-room'), function(req, res, next){
        // check if validation passed
        let errors = validationResult(req).errors;
        if(errors.length) {
            req.flash('info', "Delete room validation failed: " + JSON.stringify(errors));
            return  res.redirect(303, '/dashboard');
        }

        const refreshLodgeCount = async function(lodgeId){
            return await Lodge.findById(lodgeId).then(async (lodge) => {
                var roomCount = await Room.countDocuments({lodge: lodgeId});
                lodge.roomCount = roomCount;
                return lodge.save();
            }).catch(next);
        };
        
        Room.findById(req.body.roomId, function(err, room){
            if(err) return next(err);
            if(!room) {
                req.flash('info', "Cannot delete non-existent room");
                return res.redirect(303, `/dashboard/lodges/${req.body.lodgeId}`);
            }
            if(!room.isAvailable) {
                req.flash('info', "Room booked, cannot modify");
                return res.redirect(303, `/dashboard/lodges/${req.body.lodgeId}/${room._id}`);                                                         
            }
            
            Room.findByIdAndRemove(room._id, (err, room) => {
                if(err) return next(err);
                
                refreshLodgeCount(room.lodge).then((lodge) => {
                    req.flash('info', `Room ${room.roomNumber} deleted`);
                    return res.redirect(303, `/dashboard/lodges/${lodge._id}`);
                });
            });
        });
    })
}