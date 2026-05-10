const { stringify, parse } = require('yaml');

const yml_re = /^---\n([\s\S]*?)\n---[ \t]*\n*/m;

class Document {

    constructor(filename, content) {
        this.filename = filename;
        this.content = content;

        this.parseMeta();
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
