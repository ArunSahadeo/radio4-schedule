var webpack = require('webpack'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    dist = 'dist/',
    cssDir = 'assets/css/'
    ;

if (!fs.existsSync(dist))
{
    mkdirp(dist);
}

var distPath = path.join(__dirname, dist);

module.exports = {
  watch: true,  
  entry: ['./load.js','./assets/css/scss/style.scss'],
  output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, distPath)
  },
  module: {
    rules: [{
      test: /\.scss$/,
      use: [
          {
            loader: "file-loader",
            options: {
                name: "/assets/css/style.css"
            }
          },
          {
            loader: "css-loader"
          },
          {
            loader: "sass-loader"
          }
      ]
    }]
  },
  
}
