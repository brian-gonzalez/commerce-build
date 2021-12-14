const ESLintPlugin = require('eslint-webpack-plugin');
const RevolverPlugin = require('revolver-webpack-plugin');
const { join, resolve } = require('path');
const { ESBuildMinifyPlugin } = require('esbuild-loader');

const { getJSPaths } = require('./get-js-paths');

function getJSConfig(config, cartridgeName, scope, options) {
    // process.env.NODE_ENV is set in config.js
    const isProduction = process.env.NODE_ENV === 'production';
    const cwd = process.cwd();
    const jsPathData = getJSPaths(config, cartridgeName, scope, options);

    // Only generate a config if there's an `jsPathData.entryObject`.
    if (Object.keys(jsPathData.entryObject).length) {
        const namedConfig = {
            // If [mode] is not provided via configuration or CLI, CLI will use any valid NODE_ENV value for mode.
            devtool: isProduction ? false : 'source-map',
            entry: jsPathData.entryObject,
            name: `js-${cartridgeName}`,
            output: {
                path: join(cwd, jsPathData.outputPath),
                clean: {
                    keep(asset) {
                        return asset.indexOf('/js/') === -1;
                    },
                },
            },
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: [
                            /[\\/]node_modules[\\/]/,
                        ],
                        loader: 'esbuild-loader',
                        options: {
                            target: 'es2015',
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
                minimizer: [
                    new ESBuildMinifyPlugin({
                        target: 'es2015',
                    }),
                ],
                // moduleIds: 'deterministic',
                // runtimeChunk: 'single',
                // splitChunks: {
                //     chunks: 'all',
                //     cacheGroups: {
                //         vendor: {
                //             test: /[\\/]node_modules[\\/]/,
                //             name: 'vendors',
                //         },
                //     },
                // },
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
            stats: {
                assetsSort: 'name',
                assetsSpace: Number.MAX_SAFE_INTEGER,
                entrypoints: false,
                groupAssetsByPath: false,
                groupModulesByPath: false,
                modulesSort: 'name',
                modulesSpace: 5,
            },
        };

        return namedConfig;
    }
}

exports.getJSConfig = getJSConfig;
