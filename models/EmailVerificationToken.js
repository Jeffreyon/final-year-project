var mongoose = require('mongoose');

var emailVerificationTokenSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    token: String,
    createdAt: { type: Date, required: true, default: Date.now, expires: 21600 } // Six hours
});

var EmailVerificationToken = mongoose.model('EmailVerificationToken', emailVerificationTokenSchema);
module.exports = EmailVerificationToken;