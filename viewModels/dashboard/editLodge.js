const _ = require('lodash')
var {CURFEW_TIMES, LODGE} = require('../../lib/form-data.js');

module.exports = function(lodge){
    var lodge = _.pick(lodge, ['_id', 'name', 'landlord', 'curfew', 'bills', 'amenities', 'rules']);
    
    
    lodge.bills.map(function(bill){
        var billCopy = bill;
        billCopy.paymentOptions = [
            {
                name: "Monthly",
                code: "mo"
            },
            {
                name: "Yearly",
                code: "yr"
            }
        ];
        if(bill.payEvery == 'mo') billCopy.paymentOptions[0].selected = "selected";
        else if(bill.payEvery == 'yr') billCopy.paymentOptions[1].selected = "selected";

        billCopy.bill = LODGE.bills.map(function(billItem){
            return {
                billItem,
                selected: (billItem == billCopy.bill) ? "selected" : ''
            }
        })

        return billCopy;
    });

    lodge.amenities = lodge.amenities.map(function(amenity){
        var amenitiesList = {}
        amenitiesList.amenity = LODGE.amenities.map(function(amenityItem){
            return {
                amenityItem,
                selected: (amenityItem == amenity) ? "selected" : ''
            }
        })

        return amenitiesList;
    })

    lodge.rules.map(function(rule){
        var ruleCopy = rule;
        ruleCopy.allowedOptions = [
            {
                name: "Yes",
                allowed: true
            },
            {
                name: "No",
                allowed: false
            }
        ];
        if(rule.allowed) ruleCopy.allowedOptions[0].selected = "selected";
        else ruleCopy.allowedOptions[1].selected = "selected";

        ruleCopy.rule = LODGE.rules.map(function(ruleItem){
            return {
                ruleItem,
                selected: (ruleItem == ruleCopy.rule) ? "selected" : ''
            }
        })

        return ruleCopy;
    });

    lodge.curfew = {
        opens: CURFEW_TIMES.opens.map(function(time){
            return {
                time,
                selected: (time == lodge.curfew.opens) ? "selected" : ''
            }
        }),
        closes: CURFEW_TIMES.closes.map(function(time){
            return {
                time,
                selected: (time == lodge.curfew.closes) ? "selected" : ''
            }
        })
    }

    return {
        lodge
    }
}