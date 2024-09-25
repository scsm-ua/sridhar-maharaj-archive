const { transliterate } = require("../transliterator");

class FootnoteFile {

    constructor() {
        this.footnotes = [];
    }

    addFootnote(footnote) {
        this.footnotes.push(footnote);
    }

    getFilename() {
        return transliterate('');
    }
}

module.exports = {
    FootnoteFile
};
