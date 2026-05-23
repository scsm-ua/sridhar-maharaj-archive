const { stringify, parse } = require('yaml');
const { fixFootnotesSyntax } = require('./processors/01-fix-footnotes-syntax');
const { replaceSymbolsInMeta } = require('./processors/02-replace-symbols-in-meta');
const { cleanupDateTags } = require('./processors/03-cleanup-date-tags');
const { fixTitle } = require('./processors/04-fix-title');
const { cleanupEnglishTags } = require('./processors/05-cleanup-english-tags');
const { fixItalicBoundaries } = require('./processors/06-italic-boundaries');
const { renameAudioMp3ToSrc } = require('./processors/07-rename-audio-mp3-to-src');
const { boldVersesToCode } = require('./processors/08-bold-verses-to-code');
const { fixSlug } = require('./processors/09-fix-slug');
const { validateFootnotes } = require('./processors/10-validate-footnotes');

const yml_re = /^---\n([\s\S]*?)\n---[ \t]*\n*/m;

class Document {

    constructor(filename, content) {
        this.filename = filename;
        this.content = content;

        this.parseMeta();

        this.prepare();
    }

    prepare() {
        fixFootnotesSyntax(this);
        replaceSymbolsInMeta(this);
        cleanupDateTags(this);
        fixTitle(this);
        cleanupEnglishTags(this);
        fixItalicBoundaries(this);
        renameAudioMp3ToSrc(this);
        boldVersesToCode(this);
        fixSlug(this);
        validateFootnotes(this);
    }

    parseMeta() {
        var yml_match = this.content.match(yml_re);
        var content = this.content;
        if (yml_match) {
            var yml_part = yml_match[1];
            this.meta = parse(yml_part);
            this.text = content.replace(yml_re, '');
        } else {
            console.error('No yaml in', this.filename);
        }
    }

    render() {
        const yml = '---\n' + stringify(this.meta) + '---\n\n';
        return yml + this.text;
    }
}

module.exports = { Document };
