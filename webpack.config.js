const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const port = 3000;

module.exports = {
  mode: "development",
  entry: `./index.tsx`,
  output: {
    path: `${__dirname}/dist`,
    filename: "[name].bundle.js",
    publicPath: "/",
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        use: ["babel-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html",
    }),
  ],
  devServer: {
    host: "localhost",
    port,
    open: true,
    historyApiFallback: true,
    hot: true,
  },
};
