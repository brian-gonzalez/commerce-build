const glob = require('fast-glob');
const { join } = require('path');

const { constructPath } = require('../utils/construct-path');

/**
 * Generates full paths for each alias.
 * Each cartridge~alias pair will always point to the same path.
 *
 * @param {array} cartridgeParts Array of [cartridge, alias]
 * @param {String} inputPath cartridge scope input to build alias path
 * @param {Object} options
 * @return {Object} Returns a mutated `aliasObject` with the path data.
 */
function buildAliases(cartridgeParts, inputPath, options) {
    const cwd = process.cwd();
    let aliasObject = {};

    cartridgeParts.forEach((part) => {
        if (options.useLocales) {
            const locales = glob.sync(`${options.mainPath}/*`, { onlyDirectories: true });

            locales.forEach((currentDir) => {
                const currentLocale = currentDir.substring(options.mainDirIndex).split('/')[1];
                const localeInputPath = constructPath(options.mainPath, currentLocale, options.aliasDir);

                aliasObject[`${part}/${currentLocale}`] = join(cwd, localeInputPath);
            });
        }

        const alias = {};
        alias[part] = join(cwd, inputPath);

        aliasObject = {
            ...aliasObject,
            ...alias,
        };
    });

    return aliasObject;
}

exports.buildAliases = buildAliases;
