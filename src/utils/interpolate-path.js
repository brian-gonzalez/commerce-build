function replaceTemplate(path, templateString, value) {
    const updateRegEx = new RegExp(`{${templateString}}`, 'g');

    return path.replace(updateRegEx, value);
}

function interpolatePath(pathObj, cartridgeName) {
    const updatedPath = {};

    Object.entries(pathObj).forEach(([key, path]) => {
        updatedPath[key] = replaceTemplate(path, 'cartridge', cartridgeName);
    });

    return updatedPath;
}

exports.interpolatePath = interpolatePath;
