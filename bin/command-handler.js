#!/usr/bin/env node

const { Command } = require('commander');
const { spawn } = require('cross-spawn');

const program = new Command();

program
    .option('--scss', 'set scope to SCSS')
    .option('--js', 'set scope to JS')
    .option('--isml', 'set scope to ISML')
    .showSuggestionAfterError();

program.parse(process.argv);

const { _name: cmd } = program;
const cmdOptions = program.opts();

const { config } = require('../src/config');

const globSCSSPath = config.scss.inputPath.replace(/\{.*\}/, '**');
const globJSPath = config.js.inputPath.replace(/\{.*\}/, '**');

const actions = {
    build: {
        isml: ['isml-linter', '--build'],
        scss: ['webpack', '--scss'],
        js: ['webpack', '--js'],
    },
    lint: {
        isml: ['isml-linter'],
        scss: ['stylelint', globSCSSPath, '--allow-empty-input'],
        js: ['eslint', globJSPath, '--no-error-on-unmatched-pattern'],
    },
    fix: {
        get isml() {
            return actions.lint.isml.concat(['--autofix']);
        },
        get scss() {
            return actions.lint.scss.concat(['--fix']);
        },
        get js() {
            return actions.lint.js.concat(['--fix']);
        },
    },
    watch: {
        get isml() {
            return actions.build.isml.concat(['--watch']);
        },
        get scss() {
            return actions.build.scss.concat(['--watch']);
        },
        get js() {
            return actions.build.js.concat(['--watch']);
        },
    },
};

const scopes = [
    'isml',
    'scss',
    'js',
];

const scopeColors = [
    '#f06529.bold', // orange
    '#cd6799.bold', // pink
    '#f0db4f.bold', // gold
];

const isEmpty = (obj) => Object.keys(obj).length === 0;

const commandHandler = (options, commandName) => {
    let childProcess;
    if (!isEmpty(options)) {
        scopes.forEach((scope) => {
            if (options[scope]) {
                childProcess = spawn(
                    'npx',
                    actions[commandName][scope],
                    { stdio: 'inherit' },
                );
            }
        });
    } else {
        const labels = scopes.join().toUpperCase();
        const colors = scopeColors.join();
        const allCommand = ['concurrently', `-n=${labels}`, `-c=${colors}`];

        scopes.forEach((scope) => {
            allCommand.push(actions[commandName][scope].join(' '));
        });

        childProcess = spawn(
            'npx',
            allCommand,
            { stdio: 'inherit' },
        );
    }

    childProcess.on('error', (err) => {
        // eslint-disable-next-line no-console
        console.error(`ERROR: ${err}`);
    });
};

commandHandler(cmdOptions, cmd);
