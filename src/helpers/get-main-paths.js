const { join } = require('path');
const { existsSync } = require('fs');

/**
 * Sets the `pathData.mainFiles` paths into the `mainPaths` array if these files exists.
 * @param {[Object Literal]} pathData [description]
 * @return {[Array]}           [description]
 */
function getMainPaths(inputPath, mainFiles) {
    const cwd = process.cwd();
    const mainPaths = [];

    mainFiles.forEach((file) => {
        const currentMainPath = join(inputPath, file);

        if (existsSync(currentMainPath)) {
            mainPaths.push(join(cwd, currentMainPath));
        }
    });

    return mainPaths;
}

exports.getMainPaths = getMainPaths;
