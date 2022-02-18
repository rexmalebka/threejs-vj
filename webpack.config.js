const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
const webpack = require('webpack')

module.exports = {
	entry: {
		app: path.resolve(__dirname, 'src/index.ts'),
		app2: path.resolve(__dirname, 'src/index2.ts')
	},
	output: {
		path: path.resolve(__dirname, 'static'),
		filename: 'js/[name].js',
		publicPath: '/'
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
	plugins:[
		new VueLoaderPlugin()
	],
	module: {
		rules: [
			{
				test: /\.vue$/,
				use: 'vue-loader',
			},
			{
				test: /\.ts$/,
				loader: 'ts-loader',
				options: { appendTsSuffixTo: [/\.vue$/] }
			},{
				test: /\.css$/,
				use: [
					'style-loader',
					{ loader: 'css-loader', options: { importLoaders: 1 } },
					'postcss-loader'
				]
			}
		]
	}
}
