// css files
require("./css/custom.css");
require("./css/tailwind.css");

// js files
const noui = require("./vendor/nouislider/nouislider");
const owl = require("./vendor/owlcarousel/owl.carousel.js");

fs.readdirSync("js").forEach((file) => {
    if (file.substring(-3) == ".js") {
        let file = require("./js" + file);
    }
});
