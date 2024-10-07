const { transliterate } = require("../transliterator");
const { stringify } = require('yaml');
const { relative } = require('path');

class FootnoteFile {

    constructor(group, title, dir) {
        this.group = group;
        this.title = title;
        this.tags = [];
        this.footnotes = [];
        this.dir = dir;
    }

    addFootnote(footnote) {
        this.footnotes.push(footnote);

        [...footnote.getUsedScripturesNamesWithNubmers(), ...footnote.getUsedScripturesNames()].forEach(tag => {
            if (this.tags.indexOf(tag) === -1) {
                this.tags.push(tag);
            }
        });
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
        return transliterate(this.title);
    }

    getGroupSlug() {
        return transliterate(this.group);
    }

    getDir() {
        return this.dir + '/' + this.getGroupSlug() + '/';
    }

    renderFile() {
        if (this.footnotes.length) {
            this.tags.sort();
            var meta = {
                slug: this.getFileSlug(),
                refs: this.footnotes.map(f => relative(this.getDir(), f.documentFile.filename)),
                tags: this.tags.map(tag => {
                    return {
                        title: tag,
                        slug: transliterate(tag)
                    }
                })
            };

            var meta_str = stringify(meta);
            return `---\n${ meta_str }---\n\n` + `# ${ this.title }\n\n` + this.renderFootnotes();
        }
    }
}

module.exports = {
    FootnoteFile
};
