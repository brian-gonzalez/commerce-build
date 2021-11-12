require('dotenv').config();
const minimist = require('minimist');
const merge = require('lodash/merge');
const set = require('lodash/set');

const { appRoot } = require('./utils/app-root');
const { envXmog } = require('./utils/dontenv-xmog');

const moduleName = 'commercebuild';

// 1. get default config values
const defaultConfig = require('./helpers/default-config.json');

// 2. If `commercebuild` exists in package.json, use it over config files
// eslint-disable-next-line import/no-dynamic-require
const { commercebuild: pkgConfig } = require(`${appRoot}/package.json`);

// 3. get config file if no package configuration exists
let configFile = {};

if (!pkgConfig) {
    const configNames = [
        `.${moduleName}rc.json`,
        `.${moduleName}rc.js`,
        `${moduleName}.config.js`,
    ];

    for (let i = 0; i < configNames.length; i++) {
        try {
            // eslint-disable-next-line import/no-dynamic-require
            configFile = require(`${appRoot}/${configNames[i]}`);

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
// e.g. --build.cartridge="app_storefront_base" --build.cartridgePath="app_custom_site,app_custom_base"
const cliArgs = minimist(process.argv.slice(2));

// Overwrite build scope with option passed
// default: {scope: "js"}
if (cliArgs.scss) {
    set(cliArgs, 'build.scope', 'scss');
}

// 6. merge configs. Last in takes priority
const config = merge(defaultConfig, pkgConfig, configFile, envConfig, cliArgs.build);

exports.config = config;
