// Rules are applied in order. Each rule is [RegExp, replacement].
const symbolReplacementRules = [
    [/---/g, '—'],
    [/(?<=\d)--(?=\d)/g, '–'],
    [/--/g, '—'],
];

function replaceInString(value) {
    let result = value;
    symbolReplacementRules.forEach(([search, replacement]) => {
        result = result.replace(search, replacement);
    });

    return result;
}

function replaceSymbolsInMeta(doc) {
    if (doc.meta && typeof doc.meta.title === 'string') {
        doc.meta.title = replaceInString(doc.meta.title);
    }
    doc.text = replaceInString(doc.text);
}

module.exports = {
    replaceSymbolsInMeta,
    symbolReplacementRules
};
