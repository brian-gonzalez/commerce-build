const { join } = require('path');
const { buildAliases } = require('./build-aliases');
const { getConfig } = require('./get-config');
const { getPathData } = require('./get-path-data');
const { constructPath } = require('../utils/construct-path');
const { hasMagic } = require('../utils/has-magic');
const { toArray } = require('../utils/to-array');

/**
 * Sets the RevolverPlugin paths into an array to be used when instantiating the plugin.
 * @return {[type]} [description]
 */
function cartridgePaths(config, scope) {
    const revolverArray = [];
    const cartridges = toArray(getConfig(config, 'cartridgePath', scope));
    const mainDir = getConfig(config, 'mainDir', scope);
    const useLocales = getConfig(config, 'useLocales', scope);

    // Directory that should be the alias target location.
    // This might be different than the `main` directory name,
    // and might be positioned at a different location before or after a locale.
    const aliasDir = getConfig(config, 'aliasDir', scope);

    // { alias: path } - Used by webpack to resolve files from alternate sources.
    let aliases = {};

    const defaultLocale = useLocales ? getConfig(config, 'defaultLocale', scope) : false;

    cartridges.forEach((cartridge) => {
        const cwd = process.cwd();
        const cartridgeParts = cartridge.split('~');
        // const [cartridgeName] = cartridge.split('~');

        let { inputPath } = getPathData(config, cartridgeParts[0], scope);
        const mainDirIndex = inputPath.indexOf(`/${mainDir}/`) + mainDir.length + 1;
        const mainPath = inputPath.substring(0, mainDirIndex);

        // Constructs a path if the provided `inputPath` has glob-like pattern.
        inputPath = hasMagic(inputPath) ? constructPath(mainPath, defaultLocale, aliasDir) : inputPath;

        const cartridgeAlias = buildAliases(cartridgeParts, inputPath, {
            useLocales,
            mainPath,
            mainDirIndex,
            aliasDir,
        });

        aliases = {
            ...aliases,
            ...cartridgeAlias,
        };

        // Revolver paths do not currently work with locales.
        revolverArray.push({
            name: cartridgeParts[0],
            path: join(cwd, inputPath),
        });
    });

    return {
        paths: revolverArray,
        useRevolver: revolverArray.length > 0,
        aliases,
    };
}

exports.getCartridgePaths = cartridgePaths;
