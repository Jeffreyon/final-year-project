const miniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");

module.exports = {
    entry: "./public/bundle_entry",
    mode: process.env.NODE_ENV,
    output: {
        path: `${__dirname}/public/dist/js`,
        filename: "keybase.min.js",
    },
    plugins: [
        new miniCssExtractPlugin({
            filename: `../css/keybase.min.css`,
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
        }),
    ],
    node: {
        global: false,
    },
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
