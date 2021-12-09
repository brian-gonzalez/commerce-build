#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const { appRoot } = require('../src/utils/app-root');

async function copyConfigFiles() {
    try {
        await fs.copy(path.resolve(__dirname, '../.commerce-build-config'), `${appRoot}/.commerce-build-config`);
        console.log('commerce-config successfully copied!');
    } catch (err) {
        console.error(err);
    }
}

exports.copyConfigFiles = copyConfigFiles;
