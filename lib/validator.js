const { body, validationResult } = require('express-validator');

let dashboardValidator = function (action) {
    switch (action) {
        case 'add-lodge': {
            return [
                body('lodgeName', 'Lodge name is required').exists().bail().escape(),
                body('roomType', 'Choose among the room types').exists().isIn(["self con", "flat"]),
                body(["beds", "baths"]).exists().escape().toInt(),
                body(["landlordName", "landlordPhone"]).exists().escape(),
                body(["curfewOpens", "curfewCloses"]).exists().escape(),
                body('area', 'Choose among areas').exists().isIn(["hilltop", "odenigwe", "odim"]),
                body(['geocodeLat', 'geocodeLong']).exists().bail().isNumeric().escape().toFloat(),
                body("withKitchen").exists().escape().toBoolean()
            ]
        }; break;
        case 'edit-lodge': {
            return [
                body('lodgeName', 'Lodge name is required').exists().bail().escape(),
                body(["landlordName", "landlordPhone"]).exists().escape(),
                body(["curfewOpens", "curfewCloses"]).exists().escape(),
            ]
        }; break;
        case 'add-room': {
            return [
                body('roomNumber').exists().bail().isNumeric().escape().toInt(),
                body('price').exists().bail().isNumeric().escape().toInt(),
                body('description', 'Provide a room description').exists().bail().escape(),
                body('upstairs').optional(),
                body('bedroomAmenities').exists(),
                body('bathroomAmenities').exists(),
                body('kitchenAmenities').optional(),
            ]
        }; break;
        case 'edit-room': {
            return [
                body('price').exists().bail().isNumeric().escape().toInt(),
                body('description', 'Provide a room description').exists().bail().escape(),
                body('bedroomAmenities').exists(),
                body('bathroomAmenities').exists(),
                body('kitchenAmenities').optional(),
            ]
        }; break;
        case 'delete-room': {
            return [
                body('roomId').exists().bail().escape()
            ]
        }; break;
    }
}
let authValidator = function (action){

}
let roomsValidator = function(action){

}

module.exports = function (controller) {
    var validation = {
        validationResult: validationResult
    }

    if(controller === 'dashboard') validation.validate = dashboardValidator;
    else if(controller === 'auth') validation.validate = authValidator;
    else if(controller === 'rooms') validation.validate = roomsValidator;

    return validation;
}