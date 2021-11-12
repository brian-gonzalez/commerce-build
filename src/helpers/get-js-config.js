const ESLintPlugin = require('eslint-webpack-plugin');
const RevolverPlugin = require('revolver-webpack-plugin');
const { join, resolve } = require('path');
const { getJSPaths } = require('./get-js-paths');
const { envMode, isProduction } = require('../utils/env-mode');

function getJSConfig(config, cartridgeName, scope, options) {
    const cwd = process.cwd();
    const jsPathData = getJSPaths(config, cartridgeName, scope, options);

    // Only generate a config if there's an `jsPathData.entryObject`.
    if (Object.keys(jsPathData.entryObject).length) {
        const outputPath = join(cwd, jsPathData.outputPath);

        const namedConfig = {
            mode: envMode,
            entry: jsPathData.entryObject,
            name: `js-${cartridgeName}`,
            output: {
                path: outputPath,
                filename: '[name].js',
                chunkFilename: '[name].js',
                clean: true,
            },
            devtool: !isProduction ? 'cheap-module-source-map' : false,
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: [/node_modules/],
                        use: ['babel-loader'],
                    },
                ],
            },
            plugins: [
                new ESLintPlugin(),
                // TODO: add common chunks
                // plugins: [commonsPlugin]
                // require.ensure or System.import
            ],
            resolve: {
                plugins: (function (useRevolver) {
                    const plugins = [];

                    if (useRevolver) {
                        plugins.push(
                            new RevolverPlugin({
                                directoryList: options.cartridgePaths.paths,
                            }),
                        );
                    }

                    return plugins;
                }(options.cartridgePaths.useRevolver)),
                alias: options.cartridgePaths.aliases,
            },
            optimization: {
                splitChunks: {
                    minChunks: 2,
                },
            },
            // TODO: add dependencies
            dependencies: [],
            // infrastructureLogging: {
            //     colors: false,
            //     level: 'verbose',
            // },
            // TODO: test webpack stats from commerce-build cli
            stats: {
                colors: true,
                // assets: false,
                // modules: false,
                // builtAt: false,
                // version: false,
                // preset: 'minimal',
                // chunksSort: 'name',
                // children: false,
                // entrypoints: false,
                // chunkOrigins: false,
                // moduleTrace: true,
                // errorDetails: true,
                // modulesSort: 'size',
            },
            snapshot: {
                managedPaths: [
                    resolve(__dirname, '../node_modules'),
                ],
                immutablePaths: [],
                buildDependencies: {
                    hash: true,
                    timestamp: true,
                },
                module: {
                    timestamp: true,
                },
                resolve: {
                    timestamp: true,
                },
                resolveBuildDependencies: {
                    hash: true,
                    timestamp: true,
                },
            },
            performance: {
                assetFilter(assetFilename) {
                    return assetFilename.endsWith('.js');
                },
                hints: isProduction ? 'error' : 'warning',
                maxAssetSize: 500000,
            },
        };

        return namedConfig;
    }
}

exports.getJSConfig = getJSConfig;
