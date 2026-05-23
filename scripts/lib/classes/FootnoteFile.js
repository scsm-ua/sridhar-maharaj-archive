const { transliterate } = require("../transliterator");
const { stringify } = require('yaml');
const { relative } = require('path');

class FootnoteFile {

    constructor(group, title, slug, dir) {
        this.group = group;
        this.title = title;
        this.slug = slug;
        this.tags = new Set();
        this.scriptureNames = new Set();
        this.scriptureVerses = new Set();
        this.footnotes = [];
        this.dir = dir;
    }

    addFootnote(footnote) {
        this.footnotes.push(footnote);

        footnote.file = this;

        const names = footnote.getUsedScripturesNames() || [];
        const verses = footnote.getUsedScripturesNamesWithNubmers() || [];

        names.forEach(n => this.scriptureNames.add(n));
        verses.forEach(v => this.scriptureVerses.add(v));
        [...verses, ...names].forEach(t => this.tags.add(t));
    }

    renderFootnotes() {
        var itemsStr = [];
        var uniqueTexts = {};
        if (this.footnotes.length) {
            this.footnotes.forEach(footnote => {
                // Strip leading newlines but preserve first-line indentation (code blocks), trim trailing whitespace
                var md = footnote.getMD().replace(/^[\r\n]+/, '').trimEnd();
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

    _toTags(set) {
        return [...set].sort().map(tag => ({
            title: tag,
            slug: transliterate(tag)
        }));
    }

    getVersesTags() {
        return this._toTags(this.scriptureVerses);
    }

    renderFile() {
        if (this.footnotes.length) {
            var meta = {
                slug: this.getFileSlug(),
                refs: this.footnotes.map(f => relative(this.getDir(), f.documentFile.filename)),
            };
            if (this.scriptureNames.size) {
                meta.scriptures = this._toTags(this.scriptureNames);
            }
            if (this.scriptureVerses.size) {
                meta.verses = this._toTags(this.scriptureVerses);
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
