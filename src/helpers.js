const fs = require('fs');
const glob = require('glob');
const path = require('path');
const get = require('lodash/get');

const { config } = require('./config');

const cwd = process.cwd();

// Set NODE_ENV to development if undefined
// This helps with package that loads config based on NODE_ENV
// i.e. autoprefixer uses production unless development is explicitly set
if (process.env.NODE_ENV === undefined) {
    process.env.NODE_ENV = 'development';
}

const envMode = process.env.NODE_ENV;
const isProduction = envMode === 'production';

/**
 * Returns a configuration value from either a runtime command or a package.json's `commercebuild` property.
 * @param  {[String]} configName [The desired configuration's name to lookup]
 * @param  {[Any]} defaultValue [A default value to return in case no option is found in package.json nor from a runtime command]
 * @return {[String | Boolean]}              [description]
 */
function getConfigValue(configName, scope) {
    const currentSite = config.site;

    // Retrieve hierarchial config value
    const parsedValue = get(config, `sites.${currentSite}.${scope}.${configName}`)
        || get(config, `sites.${currentSite}.${configName}`)
        || get(config, `${scope}.${configName}`)
        || config[configName];

    return parsedValue === 'true' ? true : parsedValue === 'false' ? false : parsedValue;
}

function toArray(arr) {
    if (typeof arr === 'string') {
        return arr.split(/(?:,| )+/);
    }

    return arr;
}

function _updatePathKey(path, key, value) {
    const updateRegEx = new RegExp(`{${key}}`, 'g');

    return path.replace(updateRegEx, value);
}

function _getPathData(currentCartridge, scope) {
    const pathData = {
        inputPath: getConfigValue('inputPath', scope),
        outputPath: getConfigValue('outputPath', scope),
    };

    pathData.inputPath = _updatePathKey(pathData.inputPath, 'cartridge', currentCartridge);
    pathData.outputPath = _updatePathKey(pathData.outputPath, 'cartridge', currentCartridge);

    return pathData;
}

/**
 * Sets the paths to JS directories and files for the `currentCartridge`.
 * @param  {[String]} currentCartridge [description]
 * @return {[Object literal]}           [description]
 */
function getJSPaths(currentCartridge, options) {
    const pathData = _getPathData(currentCartridge, 'js');
    const mainPaths = getMainPaths(pathData.inputPath, options.mainFiles);
    const revolverExcludeList = toArray(getConfigValue('revolverExclude'));

    pathData.entryObject = options.getRootFiles ? _getRootFiles(pathData) : {};

    // Only attach a `main` entry object if there are mathing files.
    if (mainPaths.length) {
        pathData.entryObject[options.mainEntry] = mainPaths;
    }

    // This prevents a cartridge from resolving files from cartridges with higher priority (i.e. before the last on the list)
    // This can be overridden by adding the desired cartridge to the `revolverExclude` option.
    if (options.cartridgePaths.useRevolver && revolverExcludeList.indexOf(currentCartridge) !== -1) {
        options.cartridgePaths.useRevolver = false;
    }

    return pathData;
}

function getSCSSPaths(currentCartridge) {
    const pathData = _getPathData(currentCartridge, 'scss');

    // Name of the container/main directory that hosts locales,
    // which in turn host the files directory.
    const mainDir = getConfigValue('mainDir', 'scss');
    const mainDirIndex = pathData.inputPath.indexOf(`/${mainDir}/`) + mainDir.length + 2;
    const keepOriginalLocation = getConfigValue('keepOriginalLocation', 'scss');
    const useLocales = getConfigValue('useLocales', 'scss');

    pathData.entryObject = {};

    glob.sync(pathData.inputPath, { ignore: '**/_*.scss' }).forEach((currentFile) => {
        let targetLocationName = currentFile.substring(mainDirIndex).replace(/.scss/g, '');
        // IMPORTANT NOTE: *DO NOT USE* `path.sep` here, as glob.sync() normalizes path separators on every OS to "/".
        const localeName = targetLocationName.split('/')[0];
        const localeIndex = targetLocationName.indexOf(`${localeName}/`) + localeName.length + 1;
        const finalPathPortion = keepOriginalLocation
            ? targetLocationName.substring(localeIndex)
            : path.basename(currentFile, '.scss');

        targetLocationName = useLocales
            ? `${localeName}/css/${finalPathPortion}`
            : `css/${finalPathPortion}`;

        pathData.entryObject[targetLocationName] = path.join(cwd, currentFile);
    });

    return pathData;
}

/**
 * Sets the `pathData.mainFiles` paths into the `mainPaths` array if these files exists.
 * @param {[Object Literal]} pathData [description]
 * @return {[Array]}           [description]
 */
function getMainPaths(inputPath, mainFiles) {
    const mainPaths = [];

    mainFiles.forEach((currentFile) => {
        const currentMainPath = path.join(inputPath, currentFile);

        if (fs.existsSync(currentMainPath)) {
            mainPaths.push(path.join(cwd, currentMainPath));
        }
    });

    return mainPaths;
}

/**
 * Returns an Array with the list of includePaths for SCSS.
 */
function getIncludePaths() {
    const includePaths = [
        path.resolve('cartridges'),
        path.resolve('node_modules'),
        path.resolve('node_modules/flag-icon-css/sass'), // fix for broken SFRA includes
    ];
    const customPaths = toArray(getConfigValue('includePaths', 'scss'));

    customPaths.forEach((currentPath) => {
        const expandedPath = path.resolve(currentPath);

        if (currentPath && includePaths.indexOf(expandedPath) === -1) {
            includePaths.push(expandedPath);
        }
    });

    return includePaths;
}

/**
 * Sets the RevolverPlugin paths into an array to be used when instantiating the plugin.
 * @return {[type]} [description]
 */
function getCartridgePaths(scope) {
    const revolverArray = [];
    // Object literal with path name/alias (key) and path reference (value).
    // Used by webpack to resolve files from alternate sources.
    const aliasObject = {};
    const revolverCartridges = toArray(getConfigValue('cartridgePath', scope));
    const mainDir = getConfigValue('mainDir', scope);
    const useLocales = getConfigValue('useLocales', scope);
    // Name of the directory that should be the alias target location.
    // This might be different than the `main` directory name,
    // and might be positioned at a different location before or after a locale.
    const aliasDir = getConfigValue('aliasDir', scope);
    const defaultLocale = useLocales ? getConfigValue('defaultLocale', scope) : false;

    revolverCartridges.forEach((currentCartridge) => {
        const cartridgeParts = currentCartridge.split('~');
        const cartridgeName = cartridgeParts[0];
        let defaultInputPath = _getPathData(cartridgeName, scope).inputPath;
        const mainDirIndex = defaultInputPath.indexOf(`/${mainDir}/`) + mainDir.length + 1;
        const mainPath = defaultInputPath.substring(0, mainDirIndex);

        // Constructs a dynamic path if the provided `defaultInputPath` has blob-like patterns.
        defaultInputPath = glob.hasMagic(defaultInputPath)
            ? _constructInputPath(mainPath, defaultLocale, aliasDir)
            : defaultInputPath;

        // Build aliases based on the `cartridgeParts` Array.
        cartridgeParts.forEach((currentCartridgePart) => _getAliasPaths(
            aliasObject,
            currentCartridgePart,
            defaultInputPath,
            {
                useLocales,
                mainPath,
                mainDirIndex,
                aliasDir,
            },
        ));

        // Revolver paths do not currently work with locales.
        revolverArray.push({ name: cartridgeName, path: path.join(cwd, defaultInputPath) });
    });

    return {
        paths: revolverArray,
        useRevolver: revolverArray.length > 0,
        aliases: aliasObject,
    };
}

/**
 * Returns a clean Array of all the cartridges that should be built.
 * This method will look into a provided `cartridge` option, and if none is found then it will default to `cartridgePath`.
 * This fallback allows to simplify the setup by not need a dedicated `cartridge` option.
 * @param  {String} scope [description]
 * @return {[type]}       [description]
 */
function getCartridgeBuildList(scope) {
    const cartridgeList = toArray(getConfigValue('cartridge', scope) || getConfigValue('cartridgePath', scope));
    const excludeList = toArray(getConfigValue('exclude', scope));
    const cartridgeBuildList = [];

    cartridgeList.forEach((currentCartridge) => {
        const cartridgeParts = currentCartridge.split('~');

        // Skip cartridges that are present in the `exclude` option, as these should not be considered for a build.
        if (excludeList.indexOf(cartridgeParts[0]) === -1) {
            cartridgeBuildList.push(cartridgeParts[0]);
        }
    });

    return cartridgeBuildList;
}

/**
 * Builds an input path using the provided parameters.
 */
function _constructInputPath(mainPath, currentLocale, aliasDir) {
    return (
        mainPath + (currentLocale ? `/${currentLocale}` : '') + (aliasDir ? `/${aliasDir}` : '')
    );
}

/**
 * Generate full paths for each alias.
 * Each alias of the same group will always point to the same path.
 * Returns a mutated `aliasObject` with the path data.
 */
function _getAliasPaths(aliasObject, currentCartridgePart, defaultInputPath, options = {}) {
    if (options.useLocales) {
        glob.sync(`${options.mainPath}/*/`).forEach((currentDir) => {
            const currentLocale = currentDir.substring(options.mainDirIndex).split('/')[1];
            const localeInputPath = _constructInputPath(
                options.mainPath,
                currentLocale,
                options.aliasDir,
            );

            aliasObject[`${currentCartridgePart}/${currentLocale}`] = path.join(cwd, localeInputPath);
        });
    }

    aliasObject[currentCartridgePart] = path.join(cwd, defaultInputPath);
}

/**
 * Returns an object where key = file name, and value = file path.
 * This object is used to render the entry points on webpack.
 * @param  {[type]} pathData [description]
 * @return {[type]}        [description]
 */
function _getRootFiles(pathData, fileType = 'js') {
    const rootFiles = {};
    const fileList = glob.sync(`${pathData.inputPath}/*.${fileType}`);

    fileList.forEach(
        (currentFile) => (rootFiles[path.basename(currentFile, '.js')] = path.join(cwd, currentFile)),
    );

    return rootFiles;
}

// Logs file changes.
function logFile(file, err) {
    // \x1b[31m: red;
    // \x1b[36m: cyan;
    // more: https://github.com/shiena/ansicolor/blob/master/README.md
    const logColor = err ? '\x1b[31m%s\x1b[0m' : '\x1b[36m%s\x1b[0m';
    const logMsg = err ? 'Error on file:' : '✔ CSS built:';

    console.log(logColor, `\x1b[1m${logMsg}\x1b[21m ${file}`);
}

/**
 * Recursive check for directory existence and creation.
 * @param  {[String]} filePath [description]
 */
function ensureDirs(filePath) {
    const dirPath = path.dirname(filePath);

    if (fs.existsSync(dirPath)) {
        return true;
    }

    ensureDirs(dirPath);
    fs.mkdirSync(dirPath);
}

/**
 * Outputs the built CSS and creates the corresponding file and its map.
 * @param  {[type]} outputFile [description]
 * @param  {[type]} result     [description]
 * @return {[type]}            [description]
 */
function writeFile(outputFile, targetLocationName, fileType = 'css', result) {
    ensureDirs(outputFile);

    fs.writeFile(outputFile, result.css, (err) => {
        if (!result.map) {
            logFile(targetLocationName, err);
        }
    });

    if (result.map) {
        fs.writeFile(
            `${outputFile}.map`,
            result.map,
            logFile.bind(this, `${targetLocationName}[.${fileType}|.map]`),
        );
    }
}

/**
 * Recursively delete directories when the `--clean` flag is present.
 * This is necessary to avoid pushing outdated files when a code deployment runs.
 * @param  {[type]} targetPath [description]
 */
function cleanDirs(targetPath) {
    if (getConfigValue('clean', false)) {
        fs.rm(targetPath, { recursive: true, force: true }, (err) => {
            if (err) {
                throw err;
            }
        });
        console.log('Output path successfully cleaned!');
    }
}

exports.logFile = logFile;
exports.writeFile = writeFile;
exports.ensureDirs = ensureDirs;
exports.getConfigValue = getConfigValue;
exports.getJSPaths = getJSPaths;
exports.getSCSSPaths = getSCSSPaths;
exports.getIncludePaths = getIncludePaths;
exports.getCartridgePaths = getCartridgePaths;
exports.getCartridgeBuildList = getCartridgeBuildList;
exports.cleanDirs = cleanDirs;
exports.envMode = envMode;
exports.isProduction = isProduction;
exports.toArray = toArray;
