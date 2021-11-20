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
            devtool: !isProduction ? 'source-map' : false,
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: [
                            /[\\/]node_modules[\\/]/,
                        ],
                        use: {
                            loader: 'babel-loader',
                            options: {
                                cacheDirectory: true,
                                presets: [
                                    '@babel/preset-env',
                                ],
                            },
                        },
                    },
                ],
            },
            plugins: [
                new ESLintPlugin(),
            ],
            resolve: {
                alias: options.cartridgePaths.aliases,
                cacheWithContext: true,
                plugins: ((useRevolver, paths) => {
                    const plugins = [];

                    if (useRevolver) {
                        plugins.push(
                            new RevolverPlugin({
                                directoryList: paths,
                            }),
                        );
                    }

                    return plugins;
                })(options.cartridgePaths.useRevolver, options.cartridgePaths.paths),
            },
            optimization: {
                moduleIds: 'deterministic',
                runtimeChunk: 'single',
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        vendor: {
                            test: /[\\/]node_modules[\\/]/,
                            name: 'vendors',
                        },
                    },
                },
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
        };

        return namedConfig;
    }
}

exports.getJSConfig = getJSConfig;
