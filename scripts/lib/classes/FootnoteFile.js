const { transliterate } = require("../transliterator");
const { stringify } = require('yaml');
const { relative } = require('path');

class FootnoteFile {

    constructor(text, tag, dir) {
        this.text = text;
        this.tag = tag;
        this.footnotes = [];
        this.dir = dir;
    }

    addFootnote(footnote) {
        this.footnotes.push(footnote);
    }

    renderFootnotes() {
        var result = '';
        var uniqueTexts = {};
        if (this.footnotes.length) {
            this.footnotes.forEach(footnote => {
                var md = footnote.getMD();
                var md_trim = md.trim().replace(/\u00A0/g, ' ');
                if (!uniqueTexts[md_trim]) {
                    uniqueTexts[md_trim] = 1;
                    result += md;
                }
            });
        }
        return result;
    }

    getFileSlug() {
        return transliterate(this.text);
    }

    getTagSlug() {
        return transliterate(this.tag);
    }

    getDir() {
        return this.dir + '/' + this.getTagSlug() + '/';
    }

    renderFile() {
        if (this.footnotes.length) {
            var meta = {
                slug: this.getFileSlug(),
                refs: this.footnotes.map(f => relative(this.getDir(), f.documentFile.filename)),
                tags: [{
                    title: this.tag,
                    slug: this.getTagSlug()
                }, {
                    title: this.text,
                    slug: this.getFileSlug()
                }]
            };

            var meta_str = stringify(meta);
            return `---\n${ meta_str }---\n\n` + `# ${ this.text }\n\n` + this.renderFootnotes();
        }
    }
}

module.exports = {
    FootnoteFile
};
