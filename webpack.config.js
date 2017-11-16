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
  entry: ['./load.js','./assets/css/scss/style.scss'],
  output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, distPath)
  },
  module: {
    rules: [{
        test: /\.(sass|scss)$/,
        loader: ExtractTextPlugin.extract(['css-loader', 'sass-loader'])
      }]
  },
  plugins: [
    new ExtractTextPlugin({
        filename: '/assets/css/style.css',
        allChunks: true,
    })
  ],
  
}
