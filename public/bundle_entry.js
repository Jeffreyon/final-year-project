// css files
require("./css/tailwind.css");
require("./css/custom.css");

// js files
const noui = require("./vendor/nouislider/nouislider");
const owl = require("./vendor/owlcarousel/owl.carousel.js");

fs.readdirSync("js").forEach((file) => {
    if (file.substring(-3) == ".js") {
        let file = require("./js" + file);
    }
});
