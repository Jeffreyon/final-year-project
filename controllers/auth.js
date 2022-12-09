var User = require("../models/User.js");
var Token = require("../models/EmailVerificationToken.js");
var crypto = require("crypto");
var config = require("../config.js");
var emailService = require("../lib/email.js")(config);

const VALID_EMAIL_REGEX =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function authSignup(req, res, next) {
    const firstName = req.body.firstName || "",
        lastName = req.body.lastName || "",
        email = req.body.email || "",
        password = req.body.password || "",
        phoneNumber = req.body.phoneNumber || "";
    var redirect = req.body.redirect ? "?redirect=" + req.body.redirect : "";
    var errors = [];

    // validate form fields
    if (!firstName || firstName.length == 1) {
        errors.push("Invalid first name!");
    }
    if (!lastName || lastName.length == 1) {
        errors.push("Invalid last name!");
    }
    if (!VALID_EMAIL_REGEX.test(email)) {
        errors.push("Invalid email address!");
    }
    if (!password || password.length < 8) {
        errors.push("Password must not be less than 8 characters");
    }
    if (!phoneNumber || phoneNumber.length == 1) {
        errors.push("Invalid phone number");
    }
    // flash form field errors
    if (errors.length) {
        req.flash("info", errors);
        return res.redirect(303, "/sign-up" + redirect);
    }

    // check if email has already been used
    User.findOne({ email: email }, (err, user) => {
        if (err) {
            req.flash(
                "info",
                "Error creating your account, please try again later"
            );
            return res.redirect(303, "/sign-up" + redirect);
        }
        if (user) {
            req.flash(
                "info",
                "This email is already associated with another tenant"
            );
            return res.redirect(303, "/sign-up" + redirect);
        } else next();
    });
}

function authLogin(req, res, next) {
    const email = req.body.email || "",
        password = req.body.password || "";
    var redirect = req.body.redirect ? "?redirect=" + req.body.redirect : "";
    var errors = [];

    // validate form fields
    if (!VALID_EMAIL_REGEX.test(email)) {
        errors.push("Invalid email address");
    }
    if (!password) {
        errors.push("Password must not be empty");
    }
    // flash errors
    if (errors.length) {
        req.flash("info", errors);
        return res.redirect(303, "/log-in" + redirect);
    }

    // check if user exists
    User.findOne({ email: email }, function (err, user) {
        if (err) {
            req.flash("info", "Error logging in, please try again later");
            return res.redirect(303, "/log-in" + redirect);
        }
        if (!user) {
            req.flash("info", 'No account associated with "' + email + '"');
            return res.redirect(303, "/log-in" + redirect);
        }
        if (user) {
            User.comparePassword(password, user.password, (err, isMatch) => {
                if (err) return next(err);

                // check if password matches
                if (!isMatch) {
                    req.flash("info", "Wrong password!");
                    return res.redirect(303, "/log-in" + redirect);
                }

                // check if user is verified
                if (!user.isVerified) {
                    return res.render("auth/verify-email", {
                        layout: "email-verification",
                        userEmail: user.email,
                    });
                }
                // user is verified, create session and pass control to next handler
                else {
                    req.session.user = {
                        id: user._id,
                        name: user.name,
                        displayName: user.displayName,
                        email: user.email,
                    };
                    next();
                }
            });
        }
    });
}
function isLoggedIn(req, res, next) {
    if (req.session.user) return res.redirect(303, "/");
    next();
}

module.exports.controller = (app) => {
    /* SIGN UP ROUTES */
    app.get("/sign-up", isLoggedIn, function (req, res, next) {
        res.render("auth/sign-up", {
            layout: "auth",
            redirect: req.query.redirect,
            messages: req.flash("info"),
        });
    });
    app.post("/sign-up", authSignup, function (req, res, next) {
        // Create new user
        const newUser = new User({
            name: {
                first: req.body.firstName,
                last: req.body.lastName,
            },
            displayName: req.body.firstName + " " + req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            phoneNumber: req.body.phoneNumber,
            createdAt: Date.now(),
            role: "tenant",
        });

        User.createUser(newUser, (err, user) => {
            if (err) {
                req.flash(
                    "info",
                    "Error creating your account, please try again later"
                );
                return res.redirect(303, "/sign-up");
            }
            // create token and send to user
            new Token({
                userId: user._id,
                token: crypto.randomBytes(16).toString("hex"),
            }).save((err, token) => {
                if (err) {
                    req.flash(
                        "info",
                        "Error creating verification token, please try again later"
                    );
                    return res.redirect(303, "/sign-up");
                }
                return res.send(JSON.stringify(token));
            });
        });
    });

    /* LOG IN ROUTES */
    app.get("/log-in", isLoggedIn, function (req, res, next) {
        return res.render("auth/log-in", {
            layout: "auth",
            redirect: req.query.redirect,
            messages: req.flash("info"),
        });
    });
    app.post("/log-in", authLogin, function (req, res, next) {
        return res.redirect(303, req.body.redirect || "/");
    });

    /* LOG OUT ROUTE */
    app.get("/log-out", function (req, res, next) {
        if (!req.session.user) return res.redirect(303, "/log-in");
        delete req.session.user;
        return res.redirect(303, "/log-in");
    });

    // =====================================
    // EMAIL VERIFICATION TOKEN ROUTES
    // =====================================

    // Verify email: Create a token and send to user
    app.post("/verify-email", function (req, res, next) {
        const userEmail = req.body.email;
        if (!userEmail) return next();

        // create token and send to user
        User.findOne({ email: userEmail }, (err, user) => {
            if (err) {
                req.flash(
                    "info",
                    "Error verifying your account, please try again later"
                );
                return res.redirect(303, "/log-in");
            }
            if (!user) {
                req.flash(
                    "info",
                    "No account associated with *" + userEmail + "*"
                );
                return res.redirect(303, "/sign-up");
            }

            new Token({
                userId: user._id,
                token: crypto.randomBytes(16).toString("hex"),
            }).save((err, token) => {
                if (err) {
                    req.flash(
                        "info",
                        "Error verifying your account, please try again later"
                    );
                    return res.redirect(303, "/log-in");
                }
                emailService.sendEmailToken(
                    user.email,
                    token.token,
                    function (err) {
                        if (err) return next(err);

                        return res.render("auth/verification-link-sent", {
                            layout: "email-verification",
                            userEmail: userEmail,
                        });
                    }
                );
            });
        });
    });

    // Confirm email: Confirm verification link
    app.get("/confirm-email/:token", isLoggedIn, function (req, res, next) {
        var token = req.params.token;

        // if no token
        if (!token) next();

        // find token
        Token.findOne({ token: token }, (err, token) => {
            if (err) {
                req.flash(
                    "info",
                    "Error verifying your account, please try again later"
                );
                return res.redirect(303, "/log-in");
            }
            if (!token) {
                req.flash("info", "Token doesn't exist or has been used");
                return res.redirect(303, "/log-in");
            }

            // Token found
            User.findOne({ _id: token.userId }, (err, user) => {
                if (err) {
                    req.flash(
                        "info",
                        "Error verifying your account, please try again later"
                    );
                    return res.redirect(303, "/log-in");
                }
                if (!user) {
                    req.flash("info", "No user is associated with this token");
                    return res.redirect(303, "/log-in");
                }

                // User found
                if (user.isVerified) {
                    req.flash("info", "User already verified, Log in");
                    return res.redirect(303, "/log-in");
                }

                // Verify user
                user.isVerified = true;
                user.save((err) => {
                    if (err) {
                        req.flash(
                            "info",
                            "Error verifying your account, please try again later"
                        );
                        return res.redirect(303, "/log-in");
                    }
                    req.flash("info", "Your account has been verified, Log in");
                    return res.redirect(303, "/log-in");
                });
            });
        });
    });
};
