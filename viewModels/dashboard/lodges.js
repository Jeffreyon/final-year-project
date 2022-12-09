const _ = require('lodash');

module.exports = function(lodges){
    return {
        lodges: lodges.sort((a, b) => {
            var nameA = a.name.toUpperCase();
            var nameB = b.name.toUpperCase();

            if(nameA < nameB) return -1;
            if(nameA > nameB) return 1;

            return 0;
        }).map((lodge) => {
            return {
                _id: lodge._id,
                name: lodge.name,
                roomType: _.capitalize(lodge.roomType),
                roomCount: lodge.roomCount
            }
        })
    }
}