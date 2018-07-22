const
	devMode = process.env.NODE_ENV != 'production',
	path = require('path'),
	dist = path.join(__dirname, 'dist'),
	FileManagerPlugin = require('filemanager-webpack-plugin'),
	MiniCSSExtractPlugin = require('mini-css-extract-plugin'),
	UglifyJSPlugin = require('uglifyjs-webpack-plugin'),
	webpack = require('webpack')
;

// Define dirs

const
	scriptDir = './assets/js',
	styleDir = './assets/scss'
;

// Define paths

const paths = {
	scripts: [
		scriptDir + '/load.js'
	],

	styles: [
		styleDir + '/style.scss'
	]
};

module.exports = {
	target: 'web',

	entry: {
		'scripts.min.js': paths.scripts,
		'style': paths.styles
	},

	output: {
		filename: '[name]',
		path: dist
	},

	module: {
		rules: [
			{
				test: /\.js(x)?$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			},
			{
				test: /\.s(c|a)ss$/,
				use: [
					MiniCSSExtractPlugin.loader,
					'css-loader',
					'sass-loader'	
				],
			},
			{
				test: /\.json$/,
				exclude: /\./,
				include: /assets\/js/,
				loader: 'json-loader'
			},
			{
				test: /\.css$/,
				use: [
					MiniCSSExtractPlugin.loader,
					'css-loader',
				],
			},
			{
				test: /\.(gif|png|jpe?g|svg|ttf)$/,
				use: [{
					loader: 'file-loader',
					options: {
						name: '[name].[ext]'
					}
				}]
			},
		]
	},

	optimization: {
		minimize: true,
		minimizer: [new UglifyJSPlugin({
			include: /\.min\.js$/
		})],
	},

	plugins: [
		new MiniCSSExtractPlugin({
			filename: '[name].css',
			chunkFilename: '[name].css'
		}),

		new FileManagerPlugin({
			onStart: {
				delete: [
					dist + '/*'
				]
			},

			onEnd: {
				delete: [
					dist + '/style',
				]
			}
		}),
	]
};
