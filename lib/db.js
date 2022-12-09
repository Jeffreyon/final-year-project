const fs = require('file-system');

var db = {}

fs.readdirSync('./models').forEach(function (file) {
    if (file.substr(-3) == '.js') {
        const model = require('../models/' + file);
        filename = file.split('.')[0];
        db[filename] = model;
    }
});

return db;