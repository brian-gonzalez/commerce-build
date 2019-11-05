const fs = require('fs');
const glob = require('glob');
const path = require('path');
const minimist = require('minimist');

const DEFAULTS = {
        mainDirName: 'client',
        locale: 'default',
        js: {
            inputPath: 'cartridges/{cartridge}/cartridge/js',
            outputPath: 'cartridges/{cartridge}/cartridge/static/default/js'
        },
        styles: {
            inputPath: 'cartridges/{cartridge}/cartridge/scss/**/*.scss',
            outputPath: 'cartridges/{cartridge}/cartridge/static'
        }
    };
const cwd = process.cwd();

/**
 * Helper method to get an option value from either process.argv (--<PROPERTY>), package.json's "config" property, or passed through process.env (--env.<PROPERTY>).
 * @param  {[String]} optionName   [The desired option name to search for]
 * @param  {[Any]} defaultValue [A default value to return in case no option is found in package.json nor from a runtime command]
 * @return {[String | Boolean]}              [description]
 */
function getOption(optionName, defaultValue, scope = 'js') {
    let parsedOption = minimist(process.argv)[optionName] || process.env[`npm_config_env_${optionName}`] || process.env[`npm_package_config_${scope}_${optionName}`] || process.env[`npm_package_config_${optionName}`] || defaultValue;

    return parsedOption === 'true' ? true : (parsedOption === 'false' ? false : parsedOption);
}

function _updatePathKey(path, key, value) {
    let updateRegEx = new RegExp(`{${key}}`, 'g');

    return path.replace(updateRegEx, value);
}

function _getPathData(currentCartridge, scope = 'js') {
    let pathData = {
            inputPath: getOption('inputPath', DEFAULTS[scope].inputPath, scope),
            outputPath: getOption('outputPath', DEFAULTS[scope].outputPath, scope)
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
    let pathData = _getPathData(currentCartridge),
        revolverAllowBase = getOption('revolverBase', false),
        revolverPaths = options.revolverPaths.paths,
        mainPaths = getMainPaths(pathData.inputPath, options.mainFiles);

    pathData.entryObject = options.getRootFiles ? _getRootFiles(pathData) : {};

    //Only attach a `main` entry object if there are mathing files.
    if (mainPaths.length) {
        pathData.entryObject[options.mainEntryName] = mainPaths;
    }

    //This prevents the "base" cartridge from resolving files from cartridges with higher priority (i.e. before the last on the list)
    //This can be overriden by setting revolverBase: true
    if (!revolverAllowBase && options.revolverPaths.useRevolver && revolverPaths[revolverPaths.length - 1].name === currentCartridge) {
        options.revolverPaths.useRevolver = false;
    }

    return pathData;
}

function getSCSSPaths(currentCartridge) {
    let pathData = _getPathData(currentCartridge, 'styles'),
        //Name of the container/main directory that hosts locales, which in turn host the files directory.
        mainDirName = getOption('mainDirName', DEFAULTS.mainDirName, 'styles'),
        mainDirIndex = pathData.inputPath.indexOf(`/${mainDirName}/`) + mainDirName.length + 2,
        keepOriginalLocation = getOption('keepOriginalLocation', false, 'styles'),
        useLocales = getOption('useLocales', true, 'styles');

    pathData.entryObject = {};

    glob.sync(pathData.inputPath, {ignore: '**/_*.scss'}).forEach(function(currentFile) {
        let targetLocationName = currentFile.substring(mainDirIndex).replace(/.scss/g, ''),
            localeName = targetLocationName.split('/')[0], //IMPORANT NOTE: *DO NOT USE* `path.sep` here, as glob.sync() normalizes path separators on every OS to "/".
            localeIndex = targetLocationName.indexOf(`${localeName}/`) + localeName.length + 1,
            finalPathPortion = keepOriginalLocation ? targetLocationName.substring(localeIndex) : path.basename(currentFile, '.scss');

        targetLocationName = useLocales ? `${localeName}/css/${finalPathPortion}` : `css/${finalPathPortion}`;

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
    let mainPaths = [];

    mainFiles.forEach(function(currentFile) {
        let currentMainPath = path.join(inputPath, currentFile);

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
    let includePaths = [path.resolve('cartridges'), path.resolve('node_modules')],
        customPaths = getOption('includePaths', '', 'styles').split(/(?:,| )+/);

    customPaths.forEach(function(currentPath) {
        let expandedPath = path.resolve(currentPath);

        if (includePaths.indexOf(expandedPath) !== -1) {
            includePaths.push(expandedPath);
        }
    });

    return includePaths;
}

/**
 * Sets the RevolverPlugin paths into an array to be used when instantiating the plugin.
 * @return {[type]} [description]
 */
function getRevolverPaths(scope = 'js') {
    let revolverArray = [];
        //Object literal with path name/alias (key) and path reference (value).
        //Used by webpack to resolve files from alternate sources.
        aliasObject = {},
        revolverCartridgeString = getOption('revolverPath', '', scope),
        revolverCartridgeArray = revolverCartridgeString ? revolverCartridgeString.split(/(?:,| )+/) : [],
        mainDirName = getOption('mainDirName', DEFAULTS.mainDirName, scope),
        useLocales = getOption('useLocales', true, scope),
        //Name of the directory that should be the alias target location.
        //This might be different than the `main` directory name, and might be positioned at a different location before or after a locale.
        aliasDirName = getOption('aliasDirName', false, scope),
        defaultLocale = useLocales ? getOption('defaultLocale', DEFAULTS.locale, scope) : false;

    revolverCartridgeArray.forEach(function(currentCartridge) {
        let cartridgeParts = currentCartridge.split('::'),
            cartridgeName = cartridgeParts[0],
            inputPath = _getPathData(cartridgeName, scope).inputPath,
            mainDirIndex = inputPath.indexOf(`/${mainDirName}/`) + mainDirName.length + 1,
            mainPath = inputPath.substring(0, mainDirIndex);

        //Constructs a dynamic path if the provided `inputPath` has blob-like patterns.
        inputPath = glob.hasMagic(inputPath) ? _constructInputPath(mainPath, defaultLocale, aliasDirName) : inputPath;

        //Build aliases based on the `cartridgeParts` Array.
        if (useLocales) {
            cartridgeParts.forEach(currentPart => _getAliasPerLocale(aliasObject, currentPart, mainPath, mainDirIndex, aliasDirName));
        }

        cartridgeParts.forEach(currentPart => aliasObject[currentPart] = path.join(cwd, inputPath));

        //Revolver paths do not currently work with locales.
        revolverArray.push({name: cartridgeName, path: path.join(cwd, inputPath)});
    });

    return {
        paths: revolverArray,
        useRevolver: revolverArray.length > 0,
        aliases: aliasObject
    };
}

/**
 * Builds an input path using the provided parameters.
 */
function _constructInputPath(mainPath, currentLocale, aliasDirName) {
    return mainPath + (currentLocale ? `/${currentLocale}` : '') + (aliasDirName ? `/${aliasDirName}` : '');
}

/**
 * Generates an alias reference by locale path found.
 */
function _getAliasPerLocale(aliasObject, currentCartridge, mainPath, mainDirIndex, aliasDirName) {
    glob.sync(`${mainPath}/*/`).forEach(function(currentDir) {
        let currentLocale = currentDir.substring(mainDirIndex).split('/')[1],
            inputPath = _constructInputPath(mainPath, currentLocale, aliasDirName);

        aliasObject[`${currentCartridge}/${currentLocale}`] = path.join(cwd, inputPath);
    });
}

/**
 * Returns an object where key = file name, and value = file path.
 * This object is used to render the enty points on webpack.
 * @param  {[type]} pathData [description]
 * @return {[type]}        [description]
 */
function _getRootFiles(pathData, fileType = 'js') {
    let rootFiles = {},
        fileList = glob.sync(`${pathData.inputPath}/*.${fileType}`);

    fileList.forEach(currentFile => rootFiles[path.basename(currentFile, '.js')] = path.join(cwd, currentFile));

    return rootFiles;
}

//Logs file changes.
function logFile(file, err) {
    //\x1b[31m: red;
    //\x1b[36m: cyan;
    //more: https://github.com/shiena/ansicolor/blob/master/README.md
    let logColor = err ? '\x1b[31m%s\x1b[0m' : '\x1b[36m%s\x1b[0m',
        logMsg = err ? 'Error on file:' : '✔ CSS built:';

    console.log(logColor, `\x1b[1m${logMsg}\x1b[21m ${file}`);
}


/**
 * Recursive check for directory existence and creation.
 * @param  {[String]} filePath [description]
 */
function ensureDirs(filePath) {
    let dirPath = path.dirname(filePath);

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

    fs.writeFile(outputFile, result.css, function(err) {
        if (!result.map) {
            logFile(targetLocationName, err);
        }
    });

    if (result.map) {
        fs.writeFile(`${outputFile}.map`, result.map, logFile.bind(this, `${targetLocationName}[.${fileType}|.map]`));
    }
}

exports.logFile = logFile;
exports.writeFile = writeFile;
exports.ensureDirs = ensureDirs;
exports.getOption = getOption;
exports.getJSPaths = getJSPaths;
exports.getSCSSPaths = getSCSSPaths;
exports.getIncludePaths = getIncludePaths;
exports.getRevolverPaths = getRevolverPaths;
exports.defaultOptions = DEFAULTS;
