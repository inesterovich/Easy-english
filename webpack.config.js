const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const EslintWebpackPlugin = require('eslint-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;
const fileName = (ext) => (isDev ? `${ext}/[name].${ext}` : `${ext}/[name].[contenthash].${ext}`);

const cssLoaders = (extra) => {
    const config = [

        {
            loader: MiniCssExtractPlugin.loader,
            options: {
                publicPath: '../',
            },
        },
        {
            loader: 'css-loader',
            options: {
                sourceMap: true,
            },
        }];

    if (extra) {
        config.push(extra);
    }

    return config;
};
const babelOptions = (preset) => {
    const opts = {
        presets: [
            '@babel/preset-env',
        ],
        plugins: [
            '@babel/plugin-proposal-class-properties',
        ],
    };

    if (preset) {
        opts.presets.push(preset);
    }

    return opts;
};

const getPlugins = () => {
    const plugins = [
        new HtmlWebpackPlugin({
            template: './index.html',
            minify: {
                collapseWhitespace: isProd,
            },
            favicon: path.resolve(__dirname, 'src/icons/favicon.svg'),
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: fileName('css'),

        }),
        new CopyWebpackPlugin(
            {
                patterns: [
                    {
                        from: path.resolve(__dirname, 'src', 'images'),
                        to: path.resolve(__dirname, 'dist', 'images'),
                    },
                    {
                        from: path.resolve(__dirname, 'src', 'audio'),
                        to: path.resolve(__dirname, 'dist', 'audio'),

                    },
                    {
                        from: path.resolve(__dirname, 'src', 'icons'),
                        to: path.resolve(__dirname, 'dist', 'icons'),

                    },
                ],

            },
        ),
    ];

    if (isDev) {
        plugins.push(new EslintWebpackPlugin());
    }

    return plugins;
};

const jsLoaders = () => {
    const loaders = [{
        loader: 'babel-loader',
        options: babelOptions(),
    }];

    return loaders;
};

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        main: ['@babel/polyfill', './js/index.js'],

    },
    output: {
        filename: fileName('js'),
        path: path.resolve(__dirname, 'dist'),
        publicPath: './',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },

    devtool: isDev ? 'source-map' : false,

    devServer: {
        port: 5500,
        hot: isDev,
        injectHot: isDev,
        open: {
            app: ['chrome'],
        },
    },

    plugins: getPlugins(),
    module: {
        rules: [
            {
                test: /\.(?:gif|png|jpg|jpeg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'img/[name][ext]',
                },

            },
            {
                test: /\.ico|svg$/,
                type: 'asset/resource',
                generator: {
                    filename: 'icons/[name][ext]',
                },
            },
            {
                test: /\.mp3$/,
                type: 'asset/resource',
                generator: {
                    filename: 'audio/[name][ext]',
                },

            },
            {
                test: /\.css$/,
                use: cssLoaders(),
            },
            {
                test: /\.(scss|sass)$/,
                use: cssLoaders({
                    loader: 'sass-loader',
                    options: {
                        sourceMap: true,
                    },
                }),
            },
            {
                test: /\.less$/,
                use: cssLoaders({
                    loader: 'less-loader',
                    options: {
                        sourceMap: true,
                    },
                }),
            },

            {
                test: /.(ttf|woff|woff2|eot)$/,
                type: 'asset/inline',
            },
            {
                test: /\.xml$/,
                use: ['xml-loader'],
            },
            {
                test: /\.csv$/,
                use: ['csv-loader'],
            },

            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: jsLoaders(),
            },

        ],
    },
};
