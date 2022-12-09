const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    env: process.env.NODE_ENV,
    admin: process.env.ADMIN,
    baseUrl: process.env.BASE_URL,
    domainName: process.env.DOMAIN_NAME,
    cookieSecret: process.env.COOKIE_SECRET,
    serviceFeeQuotient: process.env.SERVICE_FEE_QUOTIENT,
    db: process.env.DATABASE_URL,
    email: {
        service: process.env.EMAIL_SERVICE,
        user: process.env.EMAIL_USERNAME,
        password: process.env.EMAIL_PASSWORD
    },
    paystack: {
        secretKey: process.env.PAYSTACK_SECRET_KEY,
        publicKey: process.env.PAYSTACK_PUBLIC_KEY,
        fee: Number(process.env.PAYSTACK_FEE)
    },
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET
    },

    // methods
    getFee: function(price){
        var cappedFee = Number(process.env.CAPPED_FEE);
        var fee = (price * this.serviceFeeQuotient) + this.paystack.fee;

        if(fee > cappedFee) fee = cappedFee;
        return fee;
    }
}