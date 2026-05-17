const { stringify, parse } = require('yaml');
const { extractTitle } = require('./processors/extract-title');
const { extractRecordId } = require('./processors/extract-record-id');
const { extractDate } = require('./processors/extract-date');
const { sortMeta } = require('./processors/sort-meta');
const { extractAudio } = require('./processors/extract-audio');
const { setLegacyFilename } = require('./processors/set-legacy-filename');
const { setLang } = require('./processors/set-lang');

const yml_re = /^---\n([\s\S]*?)\n---[ \t]*\n*/m;

class Document {

    constructor(filename, content) {
        this.filename = filename;
        this.content = content;

        this.parseMeta();

        this.prepare();
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

    prepare() {
        extractTitle(this);
        extractRecordId(this);
        extractDate(this);
        extractAudio(this);
        setLegacyFilename(this);
        setLang(this);
        sortMeta(this);
    }
}

module.exports = { Document };
