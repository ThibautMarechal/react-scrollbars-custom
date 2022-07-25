const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const RSC_PACKAGE = require("react-scrollbars-custom/package");

module.exports = (env, opt) => {
  const isDevMode = opt.mode === "development";

  return {
    target: "web",
    mode: opt.mode,
    entry: {
      "dist/js/bundle": path.join(__dirname, "src", "js", "index.jsx"),
      "dist/css/style": path.join(__dirname, "src", "scss", "style.scss"),
    },
    output: {
      path: __dirname,
      filename: "[name].[contenthash].js",
      publicPath: isDevMode ? "/" : "https://xobotyi.github.io/react-scrollbars-custom/",
    },
    resolve: {
      extensions: [".js", ".jsx"],
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          parallel: true,
        }),
      ],
      noEmitOnErrors: true,
    },
    devServer: {
      allowedHosts: "all",
      port: 3030,
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name].[contenthash].css",
      }),
      new webpack.DefinePlugin({
        RSC_VERSION: JSON.stringify(RSC_PACKAGE.version),
        RSC_NAME: JSON.stringify(RSC_PACKAGE.name),
        RSC_HOMEPAGE: JSON.stringify(RSC_PACKAGE.homepage),
        RSC_AUTHOR: JSON.stringify(RSC_PACKAGE.author),
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, "src", "index.html"),
        title: `${RSC_PACKAGE.name} demo page`,
        excludeAssets: [/css.*.js/],
        prefix: "/react-scrollbars-custom/",
      }),
    ],
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              comments: true,
              cacheDirectory: false,
              presets: [
                "@babel/preset-react",
                [
                  "@babel/preset-env",
                  {
                    targets: {
                      chrome: "58",
                      ie: "9",
                    },
                    useBuiltIns: "entry",
                    corejs: 3,
                  },
                ],
              ],
              plugins: [
                ["@babel/plugin-proposal-class-properties"],
                [
                  "@babel/plugin-transform-runtime",
                  {
                    corejs: 3,
                  },
                ],
              ],
            },
          },
        },
        {
          test: /\.scss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: "css-loader",
              options: { sourceMap: false, url: false },
            },
            {
              loader: "sass-loader",
              options: { sourceMap: false },
            },
          ],
        },
      ],
    },
  };
};
