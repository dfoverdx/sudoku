const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const ExtractCSSPlugin = require('extract-css-chunks-webpack-plugin');
var BitBarWebpackProgressPlugin = undefined;
try {
    BitBarWebpackProgressPlugin = require('bitbar-webpack-progress-plugin');
} catch {}

module.exports = function genConfig(_, options) {
    const NODE_ENV = (options.mode || process.env.NODE_ENV || 'production').trim(),
        PROD = NODE_ENV === 'production';

    /**
     * @type webpack.Configuration
     */
    const config = {
        entry: './src/index.ts',
        output: {
            filename: PROD ? '[name].min.js' : '[name].js',
        },
        optimization: {
            minimizer: [ new TerserPlugin({
                include: /\.js$/,
                sourceMap: true,
                extractComments: true,
            }) ],
            minimize: PROD
        },
        devtool: 'source-map',
        resolve: {
            extensions: [ '.js', '.json', '.ts' ]
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: [
                        /node_modules/,
                        /__tests__|__mocks__/,
                        /\btest\b/,
                    ],
                    loader: 'babel-loader'
                },
                {
                    test: /\.tsx?$/,
                    exclude: [
                        /node_modules/,
                        /__tests__|__mocks__/,
                    ],
                    loader: 'awesome-typescript-loader'
                },
                {
                    test: /\.s[ca]ss$/,
                    exclude: /node_modules/,
                    use: [
                        ExtractCSSPlugin.loader,
                        { loader: 'css-loader', options: { sourceMap: true } },
                        { loader: 'sass-loader', options: { sourceMap: true } },
                    ]
                }
            ]
        },
        plugins: [
            new ExtractCSSPlugin({
                filename: PROD ? '[name].min.css' : '[name].css',
            }),
            new webpack.DefinePlugin({
                DEVELOPMENT: !PROD,
                PRODUCTION: PROD
            }),
            BitBarWebpackProgressPlugin && new BitBarWebpackProgressPlugin(),
        ],
        externals: {
            react: 'React',
            'react-dom': 'ReactDOM'
        }
    };

    return config;
}