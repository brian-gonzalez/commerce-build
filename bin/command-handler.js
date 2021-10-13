#!/usr/bin/env node

const { Command } = require('commander');
const { spawn } = require('cross-spawn');
const { cosmiconfigSync } = require('cosmiconfig');

const explorerSync = cosmiconfigSync('commercebuild');
const { config } = explorerSync.search();

const program = new Command();

program
    .option('--scss', 'set scope to SCSS')
    .option('--js', 'set scope to JS')
    .option('--isml', 'set scope to ISML')
    .showSuggestionAfterError();

program.parse(process.argv);

const { _name: cmd } = program;
const cmdOptions = program.opts();

const actions = {
    build: {
        isml: ['isml-linter', '--build'],
        scss: ['webpack', '--scss'],
        js: ['webpack', '--js'],
    },
    lint: {
        isml: ['isml-linter'],
        scss: ['stylelint', `${config.scss.inputPath}`, '--allow-empty-input'],
        js: ['eslint', `${config.js.inputPath}`, '--no-error-on-unmatched-pattern'],
    },
    fix: {
        get isml() {
            return actions.lint.isml.concat(['--autofix']);
        },
        get scss() {
            return actions.lint.css.concat(['--fix']);
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
            return actions.build.css.concat(['--watch']);
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
