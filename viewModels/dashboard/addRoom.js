const _ = require('lodash');

module.exports = function(lodge){
    var context = {};
    context.lodge = _.pick(lodge, ['_id', 'name', 'withKitchen']);

    return context;
}