function replaceTemplate(path, part, replacement) {
    const partRegEx = new RegExp(`{${part}}`, 'g');

    return path.replace(partRegEx, replacement);
}

function interpolatePath(pathObj, pathPart, partReplacement) {
    const updatedPath = {};

    Object.entries(pathObj).forEach(([key, path]) => {
        updatedPath[key] = replaceTemplate(path, pathPart, partReplacement);
    });

    return updatedPath;
}

exports.interpolatePath = interpolatePath;
