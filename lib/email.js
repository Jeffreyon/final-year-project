var nodemailer = require('nodemailer');

module.exports = function (config) {
    var mailTransport = nodemailer.createTransport({
        service: config.email.service,
        auth: {
            user: config.email.user,
            pass: config.email.password,
        }
    });
    var fromAddresses = {
        info: '"Keybase" <info@keybase.com>',
        noReply: '"Keybase" <no-reply@keybase.com>'
    }
    var alertRecipient = 'jeffreyon11@gmail.com';
    return {
        send: function (to, subj, body) {
            mailTransport.sendMail({
                from: fromAddresses.info,
                to: to,
                subject: subj,
                html: body,
                generateTextFromHtml: true
            }, function (err) {
                if (err) console.error('Unable to send email: ' + err);
            });
        },
        sendEmailToken: function (to, token, cb) {
            mailTransport.sendMail({
                from: fromAddresses.noReply,
                to: to,
                subject: 'Account verification token',
                text: 'Hello,\n\n' + 'Please verify your account by clicking the link: ' + config.baseUrl + '\/confirm-email\/' + token + '\n'
            }, err => cb(err));
        },
        sendNewBookingAlert: function(lodgeName, cb){
            return mailTransport.sendMail({
                from: fromAddresses.noReply,
                to: alertRecipient,
                subject: 'New Booking at ' + lodgeName,
                text: 'A new booking was just made at ' + lodgeName
            }) 
        },
        sendBookingCancelledAlert: function(lodgeName, cb){
            return mailTransport.sendMail({
                from: fromAddresses.noReply,
                to: alertRecipient,
                subject: 'Booking cancelled',
                text: 'A booking at ' + lodgeName + ' was just cancelled.'
            })
        },
        sendBookingConfirmationAlert: function(lodgeName, cb){
            return mailTransport.sendMail({
                from: fromAddresses.noReply,
                to: alertRecipient,
                subject: 'Booking confirmed',
                text: 'A booking was just confirmed at ' + lodgeName
            })
        },
        emailError: function (message, filename, exception) {
            var body = '<h1>Roomstash Site Error</h1>' +
                'message:<br><pre>' + message + '</pre><br>';
            if (exception) body += 'exception:<br><pre>' + exception
                + '</pre><br>';
            if (filename) body += 'filename:<br><pre>' + filename
                + '</pre><br>';
            mailTransport.sendMail({
                from: from,
                to: alertRecipient,
                subject: 'Roomstash email error',
                html: body,
                generateTextFromHtml: true
            }, function (err) {
                if (err) console.error('Unable to send email: ' + err);
            });
        },
    }
}