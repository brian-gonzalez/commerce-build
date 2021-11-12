const { accessSync } = require('fs');
const { dirname } = require('path');

let prospectiveRootPath;

module.paths.forEach((path) => {
    try {
        accessSync(path);
        prospectiveRootPath = dirname(path);
    } catch (err) {
        // console.error(err);
    }
});

exports.appRoot = prospectiveRootPath;
