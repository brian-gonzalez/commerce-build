const { getConfig } = require('./get-config');
const { toArray } = require('../utils/to-array');

/**
 * Generates a cartridge list to be built.
 * Uses 'cartridge' key and falls back to 'cartridgePath'. Both connat be used simultaneously.
 *
 * @param  {Object} config Configuration object
 * @param  {String} scope Configuration scope to access
 * @return {Array} Returns a filtered array of cartridge paths
 */
function cartridgeBuildList(config, scope) {
    const cartridgeConfig = getConfig(config, 'cartridge', scope);
    const cartridges = cartridgeConfig.length > 0 ? toArray(cartridgeConfig) : toArray(getConfig(config, 'cartridgePath', scope));
    const excludes = toArray(getConfig(config, 'exclude', scope));

    const filteredCartridges = cartridges.reduce((filtered, cartridge) => {
        const [name] = cartridge.split('~');

        if (excludes.indexOf(name) === -1) {
            filtered.push(name);
        }

        return filtered;
    }, []);

    return filteredCartridges;
}

exports.getCartridgeBuildList = cartridgeBuildList;
