/* eslint-disable no-console */

const { spawn } = require('cross-spawn');

function cliHandler(scope, options, program) {
    const { _name: command } = program;
    const globSCSSPath = '"cartridges/**/cartridge/client/**/*.scss"';
    const globJSPath = '"cartridges/**/cartridge/client/**/js"';

    const scopes = [
        'isml',
        'js',
        'scss',
    ];

    const scopeColors = [
        '#f06529', // ISML orange
        '#f0db4f', // JS   gold
        '#cd6799', // SCSS pink
    ];

    const actions = {
        build: {
            isml: ['isml-linter', '--build'],
            scss: [
                'webpack',
                options.mode ? `--env build.scope=scss --env mode=${options.mode}` : '--env build.scope=scss',
                // ...process.argv.slice(2), // TODO: pass for cliArgs.
            ],
            js: [
                'webpack',
                options.mode ? `--env build.scope=js --env mode=${options.mode}` : '--env build.scope=js',
                // ...process.argv.slice(2), // TODO: pass for cliArgs.
            ],
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

    if (scope) {
        const childProcess = spawn(
            'npx',
            actions[command][scope].join(' '),
            { stdio: 'inherit', shell: true },
        );

        childProcess.on('error', (err) => {
            console.error(err);
        });
    } else {
        const labels = scopes.join().toUpperCase();
        const colors = scopeColors.join();
        const allCommand = ['concurrently', `-n="${labels}"`, `-c="${colors}"`];

        scopes.forEach((scopeItem) => {
            allCommand.push(`"${actions[command][scopeItem].join(' ')}"`);
        });

        const childProcess = spawn(
            'npx',
            allCommand,
            { stdio: 'inherit', shell: true },
        );

        childProcess.on('error', (err) => {
            console.error(err);
        });
    }
}

exports.cliHandler = cliHandler;
