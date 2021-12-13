const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const RevolverPlugin = require('revolver-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const { join, resolve } = require('path');

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
                clean: {
                    keep(asset) {
                        return asset.indexOf('/css/') === -1;
                    },
                },
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
                                        includePaths: getIncludePaths(config, scope),
                                        quietDeps: true,
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
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
            plugins: [
                new RemoveEmptyScriptsPlugin(),
                new MiniCssExtractPlugin(),
                // BUG: If all files being built are ignored by stylelint, it will throw an error
                // similar to --allow-empty-input
                new StylelintPlugin(),
            ],
            optimization: {
                minimizer: [
                    new CssMinimizerPlugin(),
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

exports.getSCSSConfig = getSCSSConfig;
