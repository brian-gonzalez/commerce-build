const { getMainPaths } = require('./get-main-paths');
const { getRootFiles } = require('./get-root-files');
const { getConfig } = require('./get-config');
const { getPathData } = require('./get-path-data');
const { toArray } = require('../utils/to-array');

/**
 * Sets the paths to JS directories and files for the `cartridge`.
 * @param  {[String]} cartridgeName [description]
 * @return {[Object literal]}           [description]
 */
function getJSPaths(config, cartridgeName, scope, options) {
    const pathData = getPathData(config, cartridgeName, scope);
    const mainPaths = getMainPaths(pathData.inputPath, options.mainFiles);
    const revolverExcludeList = toArray(getConfig(config, 'revolverExclude', scope));

    pathData.entryObject = options.getRootFiles ? getRootFiles(pathData) : {};

    // Only attach a `main` entry object if there are mathing files.
    if (mainPaths.length) {
        pathData.entryObject[options.mainEntry] = mainPaths;
    }

    // This prevents a cartridge from resolving files from cartridges with higher priority (i.e. before the last on the list)
    // This can be overridden by adding the desired cartridge to the `revolverExclude` option.
    if (options.cartridgePaths.useRevolver && revolverExcludeList.indexOf(cartridgeName) !== -1) {
        options.cartridgePaths.useRevolver = false;
    }

    return pathData;
}

exports.getJSPaths = getJSPaths;
