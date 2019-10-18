const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const ExtractCSSPlugin = require('extract-css-chunks-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
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
    const baseConfig = {
        optimization: {
            minimizer: [ new TerserPlugin({
                include: /\.js$/,
                sourceMap: true,
                extractComments: false,
            }) ],
            minimize: PROD
        },
        devtool: 'source-map',
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
    };

    /**
     * @type webpack.Configuration
     */
    const nodeConfig = {
        entry: {
            main: './src/index.ts',
            ocr: './src/ocr.ts',
        },
        output: {
            filename: PROD ? '[name].min.js' : '[name].js',
            path: __dirname + '/dist/node',
        },
        target: 'node',
        resolve: {
            extensions: [ '.js', '.json', '.ts' ]
        },
        plugins: [
            new webpack.DefinePlugin({
                DEVELOPMENT: !PROD,
                PRODUCTION: PROD
            }),
            BitBarWebpackProgressPlugin && new BitBarWebpackProgressPlugin(),
        ],
        externals: {
            puppeteer: 'require("puppeteer")',
        }
    };

    /**
     * @type webpack.Configuration
     */
    const webConfig = {
        entry: './src/web/index.tsx',
        output: {
            filename: PROD ? '[name].min.js' : '[name].js',
            path: __dirname + '/dist/web',
        },
        resolve: {
            extensions: [ '.js', '.json', '.ts', '.tsx' ]
        },
        plugins: [
            new ExtractCSSPlugin({
                filename: PROD ? '[name].min.css' : '[name].css',
            }),
            new CopyWebpackPlugin([
                { from: './src/web/index.htm', to: '.' }
            ]),
            new webpack.DefinePlugin({
                DEVELOPMENT: !PROD,
                PRODUCTION: PROD
            }),
            BitBarWebpackProgressPlugin && new BitBarWebpackProgressPlugin(),
        ],
        externals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            jquery: 'jQuery'
        }
    };

    return [
        nodeConfig,
        webConfig,
    ].map(config => Object.assign({}, baseConfig, config));
}