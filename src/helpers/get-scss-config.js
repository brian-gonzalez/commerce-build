const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RevolverPlugin = require('revolver-webpack-plugin');
// const StylelintPlugin = require('stylelint-webpack-plugin');
const { join, resolve } = require('path');
const { ESBuildMinifyPlugin } = require('esbuild-loader');

const { getSCSSPaths } = require('./get-scss-paths');
const { getIncludePaths } = require('./get-include-paths');

// BUG: if no additional cartridges exist, SCSS build fails
// steps: use default config files and have only app_storefront_base under cartridges
function getSCSSConfig(config, cartridgeName, scope, options) {
    // process.env.NODE_ENV is set in config.js
    const isProduction = process.env.NODE_ENV === 'production';
    const cwd = process.cwd();
    const scssPathData = getSCSSPaths(config, cartridgeName, scope, options);

    // Only generate a config if there's an `scssPathData.entryObject`.
    if (Object.keys(scssPathData.entryObject).length) {
        const namedConfig = {
            // If [mode] is not provided via configuration or CLI, CLI will use any valid NODE_ENV value for mode.
            devtool: isProduction ? false : 'source-map',
            entry: scssPathData.entryObject,
            name: `scss-${cartridgeName}`,
            output: {
                path: join(cwd, scssPathData.outputPath),
                filename: '[name].js',
                clean: true,
            },
            module: {
                rules: [
                    {
                        test: /\.(s[ac])ss$/,
                        use: [
                            MiniCssExtractPlugin.loader,
                            {
                                loader: 'css-loader',
                                options: {
                                    url: false,
                                },
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    postcssOptions: {
                                        plugins: [
                                            [
                                                'postcss-preset-env',
                                                {
                                                    // Options
                                                },
                                            ],
                                        ],
                                    },
                                },
                            },
                            {
                                loader: 'sass-loader',
                                options: {
                                    // If implementation is not specified, sass-loader will load dart-sass or node-sass.
                                    // which ever is installed. define implementation to set a preferred compiler
                                    // Prefer `dart-sass`
                                    // implementation: require('sass'),
                                    sassOptions: {
                                        // Fibers is not compatible with Node.js v16.0.0 or later
                                        fiber: false,
                                        includePaths: getIncludePaths(config, scope),
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
            plugins: [
                // Fixes: https://github.com/webpack-contrib/mini-css-extract-plugin/issues/151
                new FixStyleOnlyEntriesPlugin({
                    silent: true,
                }),
                new MiniCssExtractPlugin({
                    filename: isProduction ? '[name].[contenthash].css' : '[name].css',
                    chunkFilename: isProduction ? '[id].[contenthash].css' : '[id].css',
                }),

                // BUG: If all files being built are ignored by stylelint, it will throw an error
                // similar to --allow-empty-input
                // new StylelintPlugin(),
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
                        css: true,
                    }),
                ],
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
            // stats: {
            //     chunksSort: 'name',
            //     modules: false,
            //     children: false,
            //     entrypoints: false,
            //     chunkOrigins: false,
            // },
        };

        return namedConfig;
    }
}

exports.getSCSSConfig = getSCSSConfig;
