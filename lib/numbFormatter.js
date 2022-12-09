var wnumb = require('wnumb');

var moneyFormat = wnumb({
    prefix: "₦",
    thousand: ','
});

module.exports = {
    moneyFormat
}