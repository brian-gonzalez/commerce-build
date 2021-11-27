/* eslint-disable no-console */
const {
    mkdirSync,
    readdirSync,
    lstatSync,
    copyFileSync,
} = require('fs');
const { join } = require('path');

function copySync(from, to) {
    const src = readdirSync(from);

    mkdirSync(to, {
        recursive: true,
    });

    src.forEach((element) => {
        if (lstatSync(join(from, element)).isFile()) {
            copyFileSync(join(from, element), join(to, element));
        } else {
            copySync(join(from, element), join(to, element));
        }
    });
}

exports.copySync = copySync;
