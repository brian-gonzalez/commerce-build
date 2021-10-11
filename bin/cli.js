#!/usr/bin/env node

const commander = require('commander');
const { version, description } = require('../package.json');
const { command } = require('./command');

const program = new commander.Command();

program
    .version(version, '-v, --version', 'output the current version')
    .description(description);

program
    .addArgument(new commander.Argument('<action>', 'Action to perform').choices(['build', 'fix', 'lint', 'watch']))
    .option('--css', 'set scope to SCSS')
    .option('--js', 'set scope to JS')
    .option('--isml', 'set scope to ISML')
    .action(command);

program.parse();
