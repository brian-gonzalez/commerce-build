const { getCartridgeBuildList } = require('./helpers/cartridge-build-list');
const { getCartridgePaths } = require('./helpers/cartridge-paths');
const { getConfig } = require('./helpers/get-config');
const { setConfig } = require('./helpers/set-config');
const { updateConfig } = require('./helpers/update-config');
const { toArray } = require('./utils/to-array');

/**
 * Initializes the config for project build
 *
 * @param {Object} customConfig Custom configuration that can be merged into initial config
 * @param {Object} mergeStrategy Strategy for merging webpack configurations
 * @return {Object} Returns final configuration object
 */
function init(customConfig, mergeStrategy = {}) {
    const { config } = require('./config');
    const scope = getConfig(config, 'scope', false);

    const options = {
        mainFiles: toArray(getConfig(config, 'mainFiles', scope)),
        getRootFiles: getConfig(config, 'rootFiles', scope),
        mainEntry: getConfig(config, 'mainEntry', scope),
        cartridgePaths: getCartridgePaths(config, scope),
    };

    const cartridgeList = getCartridgeBuildList(config, scope);
    const configList = setConfig(config, cartridgeList, scope, options);

    if (customConfig) {
        updateConfig(configList, customConfig, mergeStrategy);
    }

    return configList;
}
// TODO: Remove init() call
// init();
exports.init = init;
