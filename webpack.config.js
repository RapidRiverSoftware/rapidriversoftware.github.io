const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    global: "./webpack/javascripts/global.js",
    hire_us: "./webpack/javascripts/hire_us.js"
  },
  output: {
    path: path.resolve(__dirname, "./_src/assets/javascripts/")
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        loader: "babel-loader",
        query: {
          presets: ["@babel/preset-env"]
        }
      }
    ]
  }
};
