const WebextensionPlugin = require("webpack-webextension-plugin")

module.exports = {
	mode: "development",
	devtool: "source-map",
	plugins: [
		new WebextensionPlugin({
			vendor: "chrome",
		}),
	],
	entry: {
		background: "./src/main.ts",
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
	},
}
