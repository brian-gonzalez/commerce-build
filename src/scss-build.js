//Build related includes.
const nodeSass = require('node-sass'),
        glob = require('glob'),
        path = require('path'),
        postcss = require('postcss'),
        postcssrc = require('postcss-load-config'),
        chokidar = require('chokidar'),
        minimist = require('minimist'),
        bornHelpers = require('./helpers');

let lastFileUpdated = '',
    cartridgeList = [],
    postCSSPlugins,
    envType = bornHelpers.getOption('type', 'development'),
    isProduction = envType === 'production';

//cartridgeList: Defaults to the value of package.json's npm_package_config_cartridge.
//Or pass --env.cartridge=<cartridge-name>, where 'cartridge-name' is a string. Separate each input using commas, no spaces.
function _getCartridgeList() {
    return bornHelpers.getOption('cartridge').split(/(?:,| )+/);
}

function watchStyles() {
    let styleWatcher = chokidar.watch('./cartridges/**/*.scss', {ignoreInitial: true});

    styleWatcher.on('all', emitChange);
}

function emitChange(event, path) {
    lastFileUpdated = path;

    console.log(`File changed: ${lastFileUpdated}`);

    cartridgeList.forEach(walkStyles);
}

/**
 * Start the build process for each matches .scss file found in the srcPath.
 */
function walkStyles(cartridgeName) {
    let mainDirName = bornHelpers.getOption('mainDirName', 'scss', 'styles'),
        keepOriginalLocation = bornHelpers.getOption('keepOriginalLocation', false, 'styles'),
        useLocales = bornHelpers.getOption('useLocales', true, 'styles'),
        inputPath = bornHelpers.getOption('inputPath', 'cartridges/{cartridge}/cartridge/scss/**/*.scss', 'styles'),
        outputPath = bornHelpers.getOption('outputPath', 'cartridges/{cartridge}/cartridge/static', 'styles');

    inputPath = inputPath.replace(/{cartridge}/g, cartridgeName);
    outputPath = outputPath.replace(/{cartridge}/g, cartridgeName);

    glob(inputPath, {ignore: '**/_*.scss'}, function (err, fileList) {
        fileList.forEach(parseSass.bind(this, {inputPath, outputPath, mainDirName, keepOriginalLocation, useLocales}));
    });
}

/**
 * Parse the provided SCSS file and output a single file with all the @import directives.
 * Send the new file to runPostcss
 * @param  {[String]} inputPath [description]
 * @param  {[String]} outputPath [description]
 * @param  {[String]} inputFile [description]
 */
function parseSass(options, inputFile) {
    var outputFile = '',
        mainDirIndex = inputFile.indexOf(`/${options.mainDirName}/`) + options.mainDirName.length + 2,
        targetLocationName = inputFile.substring(mainDirIndex).replace(/.scss/g, ''),
        localeName = targetLocationName.split(path.sep)[0],
        localeIndex = targetLocationName.indexOf(`${localeName}/`) + localeName.length + 1,
        finalPathPortion = options.keepOriginalLocation ? targetLocationName.substring(localeIndex) : path.basename(inputFile, '.scss');

    targetLocationName = options.useLocales ? `${localeName}/css/${finalPathPortion}` : `css/${finalPathPortion}`;
    outputFile = path.join(options.outputPath, `${targetLocationName}.css`);

    nodeSass.render({
        file: inputFile,
        outFile: outputFile,
        sourceMap: true,
        includePaths: bornHelpers.getOption('includePaths', 'cartridges, node_modules', 'styles').split(/(?:,| )+/)
    }, analyzeFile.bind(this, inputFile, outputFile, targetLocationName));
}

function analyzeFile(inputFile, outputFile, targetLocationName, err, scssResult) {
    if (err) {
        console.log('\x1b[31m%s\x1b[0m', `${err}.`, `on file:`, targetLocationName);

        return false;
    }

    if (lastFileUpdated) {
        scssResult.stats.includedFiles.forEach(function(currentFile) {
            if (currentFile.indexOf(lastFileUpdated) !== -1) {
                runPostcss(inputFile, outputFile, targetLocationName, scssResult);
            }
        });
    } else {
        runPostcss(inputFile, outputFile, targetLocationName, scssResult);
    }
}

/**
 * Process the parsed and built SASS file through Postcss [https://www.npmjs.com/package/postcss].
 * Uses the postcss configuration provided on the 'postcss.config.js' file.
 * @param  {[String]} inputFile  [description]
 * @param  {[String]} outputFile [description]
 * @param  {[Object]} scssResult [description]
 */
function runPostcss(inputFile, outputFile, targetLocationName, scssResult) {
    postcss(postCSSPlugins)
        .process(
            scssResult.css,
            {
                from: inputFile,
                to: outputFile,
                map: !isProduction ? {
                        inline: false,
                        prev: scssResult.map ? scssResult.map.toString() : false
                    } : false
            }
        ).then(bornHelpers.writeFile.bind(this, outputFile, targetLocationName, 'css'));
}

function initSCSSBuild() {
    try {
        cartridgeList = _getCartridgeList();

        postcssrc().then(({plugins}) => {
            postCSSPlugins = plugins;

            cartridgeList.forEach(walkStyles);

            if (bornHelpers.getOption('watch')) {
                console.log('SCSS watch starting...');

                watchStyles();
            }

            console.log('SCSS build in process...');
        });
    } catch (e) {
        console.log('Please either provide a default cartridge target on your package.json ("config": {"cartridge": "cartridge-name"}), or pass the cartridge using --env.cartridge=<cartridge-name>');
    }
}

exports.initSCSSBuild = initSCSSBuild;
