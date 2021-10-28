#!/usr/bin/env node

const { Command } = require('commander');
const { version, description } = require('../package.json');

const program = new Command();

// To keep this file minimal, action handlers are moved to executableFile
// command names are based on file names creating duplicates
// since multiple files share the same functionality in ./command-handler.js
program
    .version(version, '-v, --version', 'output the current version')
    .description(description)
    .command('build', 'build assets', { executableFile: 'build' })
    .command('fix', 'fix lint errors', { executableFile: 'fix' })
    .command('init', 'copy base config files to project root', { executableFile: 'init' })
    .command('lint', 'lint project', { executableFile: 'lint' })
    .command('watch', 'watch project for file changes', { executableFile: 'watch' })
    .showSuggestionAfterError();

program.parse(process.argv);
