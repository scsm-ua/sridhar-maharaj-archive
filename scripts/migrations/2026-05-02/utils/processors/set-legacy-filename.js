const path = require('path');

function setLegacyFilename(doc) {
    const filename = path.basename(doc.filename);
    doc.meta.legacy = { ...doc.meta.legacy, filename };
}

module.exports = { setLegacyFilename };
