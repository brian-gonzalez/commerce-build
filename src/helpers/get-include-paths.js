const { resolve } = require('path');
const { getConfig } = require('./get-config');
const { toArray } = require('../utils/to-array');

function getIncludePaths(config, scope) {
    const includePaths = [
        resolve('cartridges'),
        resolve('node_modules/flag-icon-css/sass'), // fix for broken SFRA includes
        resolve('node_modules'),
    ];

    const customPaths = toArray(getConfig(config, 'includePaths', scope));

    customPaths.forEach((currentPath) => {
        const expandedPath = resolve(currentPath);

        if (currentPath && includePaths.indexOf(expandedPath) === -1) {
            includePaths.unshift(expandedPath);
        }
    });

    return includePaths;
}

exports.getIncludePaths = getIncludePaths;
