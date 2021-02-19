const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const webpackMerge = require('webpack-merge');
const ESLintPlugin = require('eslint-webpack-plugin');
const revolverPlugin = require('revolver-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');

const bornHelpers = require('./helpers');

//Set to 'production' to disable mapping and enable minification:
const envType = bornHelpers.getOption('type', 'development');
const isProduction = envType === 'production';
const cwd = process.cwd();

function _getJSConfig(currentCartridge, options) {
    let jsPathData = bornHelpers.getJSPaths(currentCartridge, options);

    //Only generate a config if there's an `jsPathData.entryObject`.
    if (Object.keys(jsPathData.entryObject).length) {
        let outputPath = path.join(cwd, jsPathData.outputPath);

        //This call should be removed once upgrading to Webpack 5.20+, since it comes with a built-in.
        bornHelpers.cleanDirs(outputPath);

        return {
            mode: envType,
            entry: jsPathData.entryObject,
            name: `js-${currentCartridge}`,
            output: {
                path: outputPath,
                filename: '[name].js',
                chunkFilename: '[name].js',
                // clean: true
            },
            module: {
                rules: [{
                    test: /\.js$/,
                    exclude: [/node_modules\/(?!@borngroup)/],
                    use: ['babel-loader']
                }]
            },
            plugins: [new ESLintPlugin()],
            resolve: {
                plugins: (function(useRevolver) {
                    let plugins = [];

                    if (useRevolver) {
                        plugins.push(
                            new revolverPlugin({
                                directoryList: options.revolverPaths.paths
                            })
                        );
                    }

                    return plugins;
                })(options.revolverPaths.useRevolver),
                alias: options.revolverPaths.aliases
            },
            optimization: {
                splitChunks: {
                    minChunks: 2
                }
            },
            externals: {
                'jquery': 'jQuery'
            }
        };
    }
}

function _getStylesConfig(currentCartridge, options) {
    let scssPathData = bornHelpers.getSCSSPaths(currentCartridge, options);

    //Only generate a config if there's an `scssPathData.entryObject`.
    if (Object.keys(scssPathData.entryObject).length) {
        return {
            mode: envType,
            entry: scssPathData.entryObject,
            name: `scss-${currentCartridge}`,
            output: {
                path: path.join(cwd, scssPathData.outputPath),
                filename: '[name].js'
            },
            devtool: !isProduction ? 'source-map' : '',
            module: {
                rules: [{
                    test: /\.scss$/,
                    use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            url: false,
                            sourceMap: true
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                            sassOptions: {
                                includePaths: bornHelpers.getIncludePaths()
                            }
                        }
                    }]
                }]
            },
            resolve: {
                alias: options.revolverPaths.aliases
            },
            plugins: [
                //Fixes: https://github.com/webpack-contrib/mini-css-extract-plugin/issues/151
                new FixStyleOnlyEntriesPlugin({silent: true}),
                new MiniCssExtractPlugin({filename: '[name].css'})
            ],
            stats: {
                chunksSort: 'name',
                modules: false,
                children: false,
                entrypoints: false,
                chunkOrigins: false
            }
        };
    }
}

/**
 * Sets the configuration object per cartridge. Only push configurations if there are <main>.js files found.
 * @param {[Array]} configList [description]
 * @param {[String]} currentCartridge  [description]
 */
function _setConfig(configList, options, currentCartridge) {
    //Push back the new config into the configList.
    if (bornHelpers.getOption('js')) {
        let currentConfig = _getJSConfig(currentCartridge, options);

        if (currentConfig) {
            configList.push(currentConfig);
        }
    }

    if (bornHelpers.getOption('css')) {
        let currentConfig = _getStylesConfig(currentCartridge, options);

        if (currentConfig) {
            configList.push(currentConfig);
        }
    }
}

/**
 * Updates the build using a provided `customConfigList`.
 * This object is merged into the default build, `curentConfig`.
 * Matching properties are replaced.
 */
function _updateConfig(configList, customConfigList, mergeStrategy = {}) {
    configList.forEach(function(curentConfig, index) {
        customConfigList.forEach(function(currentCustomConfig) {
            if (curentConfig.name.indexOf(`${currentCustomConfig.name}`) !== -1) {
                //See https://github.com/survivejs/webpack-merge#merging-with-strategies
                configList[index] = webpackMerge.smartStrategy(mergeStrategy)(curentConfig, currentCustomConfig);
            }
        });
    });
}

/**
 * Starts the build.
 * @return {[Array]}     [description]
 */
function initConfig(customConfigList, mergeStrategy) {
    let scope = bornHelpers.getOption('css') ? 'styles' : 'js',
        cartridgeList = bornHelpers.getCartridgeBuildList(scope),
        options = {
            mainFiles: bornHelpers.getOption('mainFiles', 'main.js', scope).split(/(?:,| )+/),
            getRootFiles: bornHelpers.getOption('rootFiles', false, scope),
            mainEntryName: bornHelpers.getOption('mainEntryName', 'main', scope),
            revolverPaths: bornHelpers.getRevolverPaths(scope)
        },
        configList = [];

    cartridgeList.forEach(_setConfig.bind(this, configList, options));

    if (customConfigList) {
        _updateConfig(configList, customConfigList, mergeStrategy);
    }

    return configList;
}

exports.initConfig = initConfig;
