const { getConfig } = require('./get-config');
const { interpolatePath } = require('../utils/interpolate-path');

function getIOPaths(config, cartridgeName, scope) {
    const pathObj = {
        inputPath: getConfig(config, 'inputPath', scope),
        outputPath: getConfig(config, 'outputPath', scope),
    };

    const pathData = interpolatePath(pathObj, 'cartridge', cartridgeName);

    return pathData;
}

exports.getIOPaths = getIOPaths;
