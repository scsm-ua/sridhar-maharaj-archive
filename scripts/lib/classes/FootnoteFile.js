const { transliterate } = require("../transliterator");
const { stringify } = require('yaml');
const { relative } = require('path');

class FootnoteFile {

    constructor(group, title, slug, dir) {
        this.group = group;
        this.title = title;
        this.slug = slug;
        this.tags = [];
        this.footnotes = [];
        this.dir = dir;
    }

    addFootnote(footnote) {
        this.footnotes.push(footnote);

        footnote.file = this;

        [...footnote.getUsedScripturesNamesWithNubmers() || [], ...footnote.getUsedScripturesNames() || []].forEach(tag => {
            if (this.tags.indexOf(tag) === -1) {
                this.tags.push(tag);
            }
        });
    }

    renderFootnotes() {
        var itemsStr = [];
        var uniqueTexts = {};
        if (this.footnotes.length) {
            this.footnotes.forEach(footnote => {
                var md = footnote.getMD().trim();
                var md_trim = md.replace(/\u00A0/g, ' ');
                if (!uniqueTexts[md_trim]) {
                    uniqueTexts[md_trim] = 1;
                    itemsStr.push(md);
                    
                }
            });
        }

        itemsStr.sort((a, b) => {
            return b.length - a.length;
        });

        return itemsStr.join('\n\n---\n\n') + '\n';
    }

    getFileSlug() {
        return transliterate(this.slug);
    }

    getGroupSlug() {
        return transliterate(this.group);
    }

    getDir() {
        return this.dir + '/' + this.getGroupSlug() + '/';
    }

    getFullFilename() {
        return this.getDir() + this.getFileSlug() + '.md';
    }

    getTags() {
        return this.tags.map(tag => {
            return {
                title: tag,
                slug: transliterate(tag)
            }
        })
    }

    renderFile() {
        if (this.footnotes.length) {
            this.tags.sort();
            var meta = {
                slug: this.getFileSlug(),
                refs: this.footnotes.map(f => relative(this.getDir(), f.documentFile.filename)),
            };
            var tags = this.getTags();
            if (tags.length) {
                meta.tags = tags;
            }

            var meta_str = stringify(meta);

            var result = `---\n${ meta_str }---\n\n`;
            if (this.title) {
                result += `# ${ this.title }\n\n`;
            }
            result += this.renderFootnotes();

            return result;
        }
    }
}

module.exports = {
    FootnoteFile
};
