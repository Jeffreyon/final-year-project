var http = require("http");
var express = require("express");
var app = express();
var hbs = require("express-handlebars");
var fs = require("fs");
var mongoose = require("mongoose");
var config = require("./config.js");
var favicon = require("serve-favicon");
var flash = require("connect-flash");
var _ = require("lodash");
var session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const cors = require("cors");

app.enable("trust proxy");
// set environment configs
switch (app.get("env")) {
    case "development": {
        require("./populate.js").run(); // populate the database with dummy data
        var logger = require("morgan")("dev"); // set up dev logging
        break;
    }
    case "production": {
        var logger = require("morgan")("combined");
        break;
    }
}

// set up mongoose database connection
var mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
mongoose
    .connect(config.db, mongooseOptions)
    .then(() => {
        console.log("Connected to mongodb");
    })
    .catch((err) => {
        console.log(err);
    });

// set view engine
app.engine(
    "hbs",
    hbs.engine({
        partialsDir: __dirname + "/views/partials",
        defaultLayout: __dirname + "/views/layouts/main",
        extname: ".hbs",
        layoutsDir: __dirname + "/views/layouts",
        helpers: {
            section: function (name, options) {
                if (!this._sections) this._sections = {};
                this._sections[name] = options.fn(this);
                return null;
            },
            greater: function (item) {
                if (item > 1) return "s";
            },
            inc: function (number, options) {
                var index = Number(number) + 1;
                return options.fn({ index });
            },
            pagination: function (
                currentPage,
                totalPages,
                querystring,
                size,
                options
            ) {
                var startPage, endPage, context;
                (currentPage = Number(currentPage)),
                    (totalPages = Number(totalPages));

                if (arguments.length === 4) {
                    options = size;
                    size = 3;
                }

                startPage = currentPage - Math.floor(size / 2);
                endPage = currentPage + Math.floor(size / 2);

                if (startPage <= 0) {
                    endPage -= startPage - 1;
                    startPage = 1;
                }

                if (endPage > totalPages) {
                    endPage = totalPages;
                    if (endPage - size + 1 > 0) {
                        startPage = endPage - size + 1;
                    } else {
                        startPage = 1;
                    }
                }

                context = {
                    startFromFirstPage: false,
                    pages: [],
                    endAtLastPage: false,
                    querystring: querystring,
                    prev: currentPage - 1,
                    next: currentPage + 1,
                    endPage: totalPages,
                };
                if (startPage === 1) {
                    context.startFromFirstPage = true;
                }
                for (var i = startPage; i <= endPage; i++) {
                    context.pages.push({
                        page: i,
                        isCurrent: i === currentPage,
                    });
                }
                if (endPage === totalPages) {
                    context.endAtLastPage = true;
                }

                return options.fn(context);
            },
            bookingStatus: function (status, options) {
                this[status] = true;
                return options.fn(this);
            },
            checkEnv: function (options) {
                var env = config.env;
                this[env] = true;
                return options.fn(this);
            },
            json_context: function (context) {
                return JSON.stringify(context);
            },
            form_data: function (name, options) {
                var context = {};
                // get the form data
                if (name) {
                    switch (name.toUpperCase()) {
                        case "AREAS": {
                            var { AREAS } = require("./lib/form-data.js");
                            context[name] = AREAS;

                            break;
                        }
                        case "ROOM_TYPES": {
                            var { ROOM_TYPES } = require("./lib/form-data.js");
                            context[name] = ROOM_TYPES;

                            break;
                        }
                        case "CURFEW_TIMES": {
                            var {
                                CURFEW_TIMES,
                            } = require("./lib/form-data.js");
                            context[name] = CURFEW_TIMES;

                            break;
                        }
                        case "LODGE": {
                            var { LODGE } = require("./lib/form-data.js");
                            context[name] = LODGE;

                            break;
                        }
                        case "ROOM": {
                            var { ROOM } = require("./lib/form-data.js");
                            context[name] = ROOM;

                            break;
                        }
                    }

                    return options.fn(context);
                }
            },
            cap: function (string) {
                console.log(string);
                return _.capitalize(string);
            },
        },
    })
);
app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.set("port", process.env.PORT || 3000);

// helmet
app.use(
    helmet({
        useDefaults: false,
        contentSecurityPolicy: {
            directives: {
                "img-src": ["*", "'self'", "https://source.unsplash.com"],
                "script-src": ["unsafe-eval"],
            },
        },
    })
);

app.use(cors());

// set up logging
app.use(logger);
// serve favicon
app.use(favicon(__dirname + "/public/img/favicon.ico"));

/* Middlewares */
app.use(express.static(__dirname + "/public")); // serve static files
app.use(require("body-parser").json());
app.use(require("body-parser").urlencoded({ extended: true })); // form bodyparser
// sessions
app.use(
    session({
        secret: config.cookieSecret,
        name: "sid",
        secure: app.get("env") === "development" ? false : true,
        cookie: {
            httpOnly: true,
            domain: config.domainName,
            path: "/",
        },
        saveUninitialized: false,
        resave: false,
        store: MongoStore.create({
            mongoUrl: config.db,
            touchAfter: 24 * 3600,
        }),
    })
);
app.use(flash()); // session flash messages

app.use(require("csurf")()); // csrf middleware
app.use(function (req, res, next) {
    res.locals._csrfToken = req.csrfToken();
    next();
});
// logged in user
app.use(function (req, res, next) {
    if (req.session.user) {
        res.locals.user = req.session.user;
    }
    next();
});

// controllers
fs.readdirSync("controllers").forEach(function (file) {
    if (file.substr(-3) == ".js") {
        const route = require("./controllers/" + file);
        route.controller(app);
    }
});

// 404 error handler
app.use(function (req, res) {
    res.status(404);
    res.render("404", { layout: "error" });
});

// catch all error handler
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).render("500", { layout: "error" });
});

// server
http.createServer(app).listen(app.get("port"), () => {
    console.log(
        `Server started in ${app.get("env")} mode: localhost:${app.get("port")}`
    );
});
