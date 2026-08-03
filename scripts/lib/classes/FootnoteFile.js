const { transliterate } = require("../transliterator");
const { stringify } = require('yaml');
const { relative } = require('path');

function fixNbSpace(md) {
    if (!md) return md;
    return md.replace(/\u00A0/g, ' ');
}

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
        var longestText;
        var longestVerse;
        var uniqueTexts = {};
        var uniqueVerses = {};
        if (this.footnotes.length) {
            this.footnotes.forEach(footnote => {
                // var md1 = footnote.getMD();
                // var md_trim = fixNbSpace(md);
                const { verse, text } = footnote.getVerseAndTextSplitted();
                var mdVerseFromDoc = footnote.getVerseMD();

                // console.log()
                // console.log('---deubg 1', text)
                // console.log()
                // console.log('---deubg 2', md1)
                // console.log()

                var text_trim = fixNbSpace(text);
                var verse_trim = fixNbSpace(verse);
                var mdVerseFromDoc_trim = fixNbSpace(mdVerseFromDoc);

                if (!longestText || text.length > longestText.length) {
                    longestText = text;
                }

                if (verse) {
                    if (!longestVerse || verse.length > longestVerse.length) {
                        longestVerse = verse;
                    }
                }

                if (mdVerseFromDoc) {
                    if (!longestVerse || mdVerseFromDoc.length > longestVerse.length) {
                        longestVerse = mdVerseFromDoc;
                    }
                }

                const parts = [];

                if (mdVerseFromDoc_trim && !uniqueVerses[mdVerseFromDoc_trim]) {
                    uniqueVerses[mdVerseFromDoc_trim] = 1;
                    parts.push(mdVerseFromDoc);
                }

                if (verse_trim && !uniqueVerses[verse_trim]) {
                    uniqueVerses[verse_trim] = 1;
                    parts.push(verse);
                }

                if (text_trim && !uniqueTexts[text_trim]) {
                    uniqueTexts[text_trim] = 1;
                    parts.push(text);
                }

                const md = parts.filter(i => i).join('\n\n---\n\n');
                if (md) {
                    itemsStr.push(md);
                }
            });
        }

        itemsStr.sort((a, b) => {
            return b.length - a.length;
        });

        var longestItem = [
            longestVerse,
            longestText
        ].filter(i => i).join('\n\n');

        var longestItemForComparision = [
            longestVerse,
            longestText
        ].filter(i => i).join('\n\n---\n\n');

        var longestItemIdx = itemsStr.indexOf(longestItemForComparision);
        if (longestItemIdx > -1) {
            itemsStr.splice(longestItemIdx, 1);
        }

        itemsStr.unshift(longestItem);
    
        return itemsStr.join('\n\n------\n\n') + '\n';
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
            
            result += this.renderFootnotes();

            return result;
        }
    }
}

module.exports = {
    FootnoteFile
};
