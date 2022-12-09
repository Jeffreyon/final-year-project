const fs = require('fs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const config = require('../config.js')

// set up multer disk storage
var storage = multer.diskStorage({
    filename: function (req, file, cb) {
        // get file extension
        var extension = '.' + file.mimetype.split('/')[1];
        cb(null, Date.now() + extension);
    }
})

var fileUploader = multer({storage: storage});

// set up cloudinary
cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret
});

// upload to cloud
function uploadToCloud(files, folder){
    var uploadedFilesPromises = [];

    files.forEach(function(file){
        uploadedFilesPromises.push(
            cloudinary.uploader.upload(
                file.path,
                {public_id: `${folder}/${Date.now()}`}
            )
        )
    });

    return Promise.all(uploadedFilesPromises);
}

module.exports = {
    fileUploader,
    uploadToCloud
}