const { getConfig } = require('./get-config');
const { interpolatePath } = require('../utils/interpolate-path');

function getPathData(config, cartridgeName, scope) {
    const pathPairing = {
        inputPath: getConfig(config, 'inputPath', scope),
        outputPath: getConfig(config, 'outputPath', scope),
    };

    const pathData = interpolatePath(pathPairing, cartridgeName);

    return pathData;
}

exports.getPathData = getPathData;
