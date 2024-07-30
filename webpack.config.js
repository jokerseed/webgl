/*
 * @Author: Joker
 * @Date: 2023-05-08 11:06:31
 * @LastEditTime: 2023-07-12 14:52:27
 * @filePath: Do not edit
 * @Description: 
 */
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require("webpack");

module.exports = {
    entry: [
        './src/Main.ts'
    ],
    mode: "development",
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'bin'),
    },
    devServer: {
        host: "192.168.0.72",
        port: 3000,
        open: true,
        static: './bin',
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
    ],
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            test: /\.ts(\?.*)?$/i,
            minify: TerserPlugin.esbuildMinify
        })],
    },
    cache: {
        type: "filesystem",
        cacheDirectory: path.resolve(__dirname, ".cache/webpack"),
        buildDependencies: {
            config: [__filename],
        },
    }
};