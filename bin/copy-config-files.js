#!/usr/bin/env node
/* eslint-disable no-console */

const { resolve } = require('path');
const { copySync } = require('../src/utils/copy-sync');
const { appRoot } = require('../src/utils/app-root');

function copyConfigFiles() {
    const configDir = resolve(__dirname, '../.commerce-build-config');
    const destDir = `${appRoot}/.commerce-build-config`;

    try {
        copySync(configDir, destDir);
        console.log('commerce-config successfully copied!');
    } catch (err) {
        console.error(`Error: ${err.message}`);
    }
}

exports.copyConfigFiles = copyConfigFiles;
