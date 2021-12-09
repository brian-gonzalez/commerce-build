#!/usr/bin/env node

const { Command, Option, Argument } = require('commander');

const { version, description } = require('../package.json');
const { cliHandler } = require('./cli-handler');

const program = new Command();

function errorColor(str) {
    // Add ANSI escape codes to display text in red.
    return `\x1b[31m${str}\x1b[0m`;
}

program
    .version(version, '-v, --version', 'output the current version')
    .description(description);

program
    .command('init')
    .description('copy configuration files to project root')
    .action(() => require('./copy-config-files').copyConfigFiles());

program
    .command('build', { isDefault: true })
    .description('build cartridge assets')
    .addArgument(new Argument('[scope]', 'set scope commerce-build commands').choices(['isml', 'js', 'scss']))
    .addOption(new Option('--mode <env>', 'build environment mode').choices(['development', 'production']))
    .action((scope, options, command) => cliHandler(scope, options, command))
    .allowUnknownOption()
    .showSuggestionAfterError();

program
    .command('fix')
    .description('fix lint errors in cartridge source files')
    .addArgument(new Argument('[scope]', 'set scope commerce-build commands').choices(['isml', 'js', 'scss']))
    .action((scope, options, command) => cliHandler(scope, options, command))
    .showSuggestionAfterError();

program
    .command('lint')
    .description('lint cartridge source files')
    .addArgument(new Argument('[scope]', 'set scope commerce-build commands').choices(['isml', 'js', 'scss']))
    .action((scope, options, command) => cliHandler(scope, options, command))
    .showSuggestionAfterError();

program
    .command('watch')
    .description('monitor cartridge source files for changes')
    .addArgument(new Argument('[scope]', 'set scope commerce-build commands').choices(['isml', 'js', 'scss']))
    .action((scope, options, command) => cliHandler(scope, options, command))
    .showSuggestionAfterError();

program
    .configureOutput({
        outputError: (str, write) => write(errorColor(str)),
    });

program.parse(process.argv);
