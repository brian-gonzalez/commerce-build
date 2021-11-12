const glob = require('glob');
const { basename, join } = require('path');

/**
 * Returns an object where key = file name, and value = file path.
 * This object is used to render the entry points on webpack.
 * @param  {[type]} pathData [description]
 * @return {[type]}        [description]
 */
function getRootFiles(pathData, fileType = 'js') {
    const cwd = process.cwd();
    const rootFiles = {};
    const fileList = glob.sync(`${pathData.inputPath}/*.${fileType}`);

    fileList.forEach(
        (currentFile) => {
            rootFiles[basename(currentFile, '.js')] = join(cwd, currentFile);
        },
    );

    return rootFiles;
}

exports.getRootFiles = getRootFiles;
