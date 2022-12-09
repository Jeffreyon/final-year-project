const miniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: "./public/bundle_entry",
    mode: "development",
    output: {
        path: `${__dirname}/public/dist/js`,
        filename: "keybase.min.js",
    },
    plugins: [
        new miniCssExtractPlugin({
            filename: `../css/keybase.min.css`,
        }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    miniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            url: false,
                        },
                    },
                ],
            },
        ],
    },
};
