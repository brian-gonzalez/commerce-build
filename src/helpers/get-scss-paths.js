const glob = require('fast-glob');

const { basename, join } = require('path');

const { getConfig } = require('./get-config');
const { getPathData } = require('./get-path-data');

function getSCSSPaths(config, cartridgeName, scope) {
    const cwd = process.cwd();
    const pathData = getPathData(config, cartridgeName, scope);

    // Name of the container/main directory that hosts locales,
    // which in turn host the files directory.
    const mainDir = getConfig(config, 'mainDir', scope);
    const mainDirIndex = pathData.inputPath.indexOf(`/${mainDir}/`) + mainDir.length + 2;
    const keepOriginalLocation = getConfig(config, 'keepOriginalLocation', scope);
    const useLocales = getConfig(config, 'useLocales', scope);

    pathData.entryObject = {};

    const tempArr = glob.sync(pathData.inputPath, { ignore: '**/_*.scss' });

    tempArr.forEach((currentFile) => {
        let targetLocationName = currentFile.substring(mainDirIndex).replace(/.scss/g, '');

        const localeName = targetLocationName.split('/')[0];
        const localeIndex = targetLocationName.indexOf(`${localeName}/`) + localeName.length + 1;
        const finalPathPortion = keepOriginalLocation
            ? targetLocationName.substring(localeIndex)
            : basename(currentFile, '.scss');

        targetLocationName = useLocales
            ? `${localeName}/css/${finalPathPortion}`
            : `css/${finalPathPortion}`;

        pathData.entryObject[targetLocationName] = join(cwd, currentFile);
    });

    return pathData;
}

exports.getSCSSPaths = getSCSSPaths;
