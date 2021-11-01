// eslint-disable-next-line no-unused-vars
const dotenv = require('dotenv').config();
const appRoot = require('app-root-dir');
const minimist = require('minimist');
const merge = require('lodash/merge');
const set = require('lodash/set');

const { envXmog } = require('./dontenv-xmog');

const moduleName = 'commercebuild';

// 1. get default config values
const defaultConfig = require('./config.default.json');

// 2. If `commercebuild` exists in package.json, use it over config files
// eslint-disable-next-line import/no-dynamic-require
const { commercebuild: pkgConfig } = require(`${appRoot.get()}/package.json`);

// 3. get config file if no package configuration exists
let configFile = {};

if (!pkgConfig) {
    const configNames = [
        `.${moduleName}rc.json`,
        `.${moduleName}rc.js`,
        `${moduleName}.config.js`,
    ];

    // loop configNames and attempt to load the file
    for (let i = 0; i < configNames.length; i++) {
        try {
            // eslint-disable-next-line import/no-dynamic-require
            configFile = require(`${appRoot.get()}/${configNames[i]}`);
            // if file is found and loaded, exit loop early
            break;
        } catch (err) {
            // config file not found, intercept error and continue
        }
    }
}

// 4. get BUILD env variables
// e.g. BUILD_cartridge=app_storefront_base
// returns an object with filtered key.
// i.e. envXmog(process.env, 'BUILD_') --> { build: {} }
const envConfig = envXmog(process.env, 'BUILD_').build;

// 5. get build options passed via CLI
// e.g. --build.cartridge="app_storefront_base" --build.revolverPath="app_custom_site,app_custom_base"
const cliArgs = minimist(process.argv.slice(2));

// Overwrite build scope with option passed
// default: {scope: "js"}
if (cliArgs.scss) {
    set(cliArgs, 'build.scope', 'scss');
}

// 6. merge configs. Last in takes priority
const config = merge(defaultConfig, pkgConfig, configFile, envConfig, cliArgs.build);

module.exports = {
    config,
};
