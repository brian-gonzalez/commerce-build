const { getCartridgeBuildList } = require('./helpers/cartridge-build-list');
const { getCartridgePaths } = require('./helpers/cartridge-paths');
const { getConfig } = require('./helpers/get-config');
const { initConfig } = require('./helpers/init-config');
const { setConfig } = require('./helpers/set-config');
const { updateConfig } = require('./helpers/update-config');
const { toArray } = require('./utils/to-array');

/**
 * Initializes the config for project build
 *
 * @param {Object} webpackEnv --env parsed cli args from Webpack
 * @param {Object} customConfig Custom configuration that can be merged into initial config
 * @param {Object} mergeStrategy Strategy for merging webpack configurations
 * @return {Object} Returns final configuration object
 */
function init(webpackArgs, customConfig = false, mergeStrategy = {}) {
    const config = initConfig(webpackArgs);
    const scope = getConfig(config, 'scope');
    const options = {
        mainFiles: toArray(getConfig(config, 'mainFiles', scope)),
        getRootFiles: getConfig(config, 'rootFiles', scope),
        mainEntry: getConfig(config, 'mainEntry', scope),
        cartridgePaths: getCartridgePaths(config, scope),
    };

    const cartridgeList = getCartridgeBuildList(config, scope);
    let configList = setConfig(config, cartridgeList, scope, options);

    // apply custom configuration
    if (customConfig) {
        configList = updateConfig(configList, customConfig, mergeStrategy);
    }

    return configList;
}

exports.init = init;
