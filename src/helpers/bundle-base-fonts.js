/* eslint-disable no-console */
const { join } = require('path');
const { copySync } = require('../utils/copy-sync');
const { appRoot } = require('../utils/app-root');

function bundleBaseFonts() {
    const fontBaseDir = join(appRoot, 'cartridges/app_storefront_base/cartridge/static/default/fonts');
    const flagIcons = join(appRoot, 'node_modules/flag-icon-css/flags');
    const fontAwesome = join(appRoot, 'node_modules/font-awesome/fonts');

    try {
        copySync(flagIcons, `${fontBaseDir}/flags`);
        copySync(fontAwesome, fontBaseDir);
    } catch (err) {
        console.error(`Error: ${err.message}`);
    }
}

exports.bundleBaseFonts = bundleBaseFonts;
