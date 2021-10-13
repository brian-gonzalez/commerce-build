#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs-extra');
const path = require('path');
const appRoot = require('app-root-dir');
const { Command } = require('commander');

const program = new Command();

program
    .option('--overwrite', 'set scope to SCSS')
    .showSuggestionAfterError();

program.parse(process.argv);

async function copyFiles() {
    try {
        await fs.copy(path.resolve(__dirname, '../dist/.commerce-build-config'), `${appRoot.get()}/.commerce-build-config`);
        console.log('commerce-config successfully copied!');
    } catch (err) {
        console.error(err);
    }
}

copyFiles();
