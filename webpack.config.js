module.exports = {
	mode: "development",
	devtool: "source-map",

	entry: {
		background: "./src/main.ts",
		overview: "./src/gui.tsx",
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
