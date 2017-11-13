var webpack = require('webpack'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    srcDir = 'src/js',
    distDir = 'dist/js/',
    cssDir = 'assets/css/'
    ;

if (!fs.existsSync(srcDir))
{
    mkdirp(srcDir);
}

if (!fs.existsSync(distDir))
{
    mkdirp(distDir);
}

var srcPath = path.join(__dirname, '/src/js'),
    distPath = path.join(__dirname, '/dist/js');

module.exports = {
  watch: true,  
  entry: ['./load.js', './assets/css/scss/style.scss'],
  output: {
    path: distPath,
    filename: 'bundle.js'
  },
  module: {
    rules: [{
      test: /\.scss$/,
      use: [
          {
            loader: "file-loader",
            options: {
                name: "style.css",
                outputPath: cssDir
            }
          },
          {
            loader: "css-loader"
          },
          /*
          {
            loader: "postcss-loader"
          },
          */
          {
            loader: "sass-loader"
          }
      ]
    }]
  }
}
