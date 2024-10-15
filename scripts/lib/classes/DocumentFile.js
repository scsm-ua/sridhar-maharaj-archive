// const { transliterate } = require("./transliterator");

/// TODO: – use short between 1-2 => 1–2 

const { Footnote } = require("./Footnote");
const { stringify, parse } = require('yaml');

const yml_re = /^---(.|\n)+---(\s|\n)+/m;

class DocumentFile {

    constructor(factory, filename, content) {
        this.factory = factory;
        this.filename = filename;
        this.content = content;
        this.footnotes = [];

        this.parse();
    }

    parse() {
        var yml_match = this.content.match(yml_re);
        var content = this.content;
        if (yml_match) {
            var yml_part = yml_match[0].replace(/^---\n*/m, '').replace(/\n*---\n*$/m, '');
            this.meta = parse(yml_part);
            // console.log(JSON.stringify(yml_part), this.meta)
            content = content.replace(yml_re, '');
        }

        // Replace symbols after yml.
        content = content.replace(/(\d)-(\d)/g, '$1–$2');        

        var lines = content.split('\n');
        this.nodes = getLevel1Nodes(lines);
        
        var footnotes_nodes = getFootnotesNodes(this.nodes);
        footnotes_nodes.forEach(nodes => {
            this.footnotes.push(new Footnote(this, nodes));
        });
    }

    renderFootnotes() {
        var result = '';
        if (this.footnotes.length) {
            result += '---\n';
            result += this.filename;
            result += '\n---\n\n';
            this.footnotes.forEach(footnote => {
                result += footnote.renderDebug();
            });
        }
        return result;
    }

    renderFile() {
        var result = '';

        this.nodes.forEach(n => {

            if (n.footnote_flag) return;

            switch(n.type) {
                case 'h1':
                    result += '# ' + n.text + '\n';
                    break;
                case 'code':
                    result += '    ' + n.text + '\n';
                    break;
                case 'p':
                    result += n.text + '\n';
                    break;
                case 'br':
                    result += '\n';
                    break;
            }
        });

        

        this.footnotes.forEach(f => {
            result += f.renderWithLink();

            if (f.file) {
                this.meta.tags = this.meta.tags || [];
                var tags = f.file.getTags();
                tags.forEach(tag => {
                    if (!this.meta.tags.find(t => t.slug === tag.slug)) {
                        this.meta.tags.push(tag);
                    }
                });
            }
        });

        result = result.replace(/\n$/, '');

        var yml = '---\n' + stringify(this.meta) + '---\n\n';

        return yml + result;
    }
}

function getFootnotesNodes(nodes) {
    var footnotes = [];
    var current_footnote;
    nodes.forEach(node => {
        if (node.type === 'footnote') {
            current_footnote = [];
            current_footnote.push(node);
            footnotes.push(current_footnote);

            node.footnote_flag = true;

        } else if (current_footnote) {

            if (node.type === 'br') {

                current_footnote.push(node);

                node.footnote_flag = true;

            } else if (node.type === 'footnote_tab') {

                current_footnote.push(Object.assign({}, node, {type: 'code'}));

                node.footnote_flag = true;

            } else if (node.type === 'code') {

                current_footnote.push(Object.assign({}, node, {type: 'p'}));

                node.footnote_flag = true;

            } else {
                console.error('Unsupported in footnote', node);
            }

        }
    });
    return footnotes;
}

/**

{
    type: 'h1',
    text: '005. 1982.07.05.B1 Поиск Шри Кришны — сам себе награда'
},
{
    type: 'p',
    text: 'Обрести это или не обрести — это в Его распоряжении...'
},
{
    type: 'code',
    text: 'а̄ш́лиш̣йа ва̄ па̄да-рата̄м̇ пинаш̣т̣у ма̄м'
},
{
    type: 'br'
}
*/


function getLevel1Nodes(lines) {
    var nodes = [];

    lines.forEach(line => {
        var { id, match } = detectLine(line);
        if (id) {
            switch(id) {
                case 'h1':
                    nodes.push({
                        type: 'h1',
                        text: match[1]
                    });
                    break;
                case 'tab':
                    nodes.push({
                        type: 'code',
                        text: match[1]
                    });
                    break;
                case 'footnote':
                    nodes.push({
                        type: 'footnote',
                        id: match[1],
                        text: match[2]
                    });
                    break;
                case 'footnote_tab':
                    nodes.push({
                        type: 'footnote_tab',
                        text: match[1]
                    });
                    break;
                default:
                    console.error('Unknown line id', id);
                    break;
            }
        } else {
            if (line.trim()) {
                nodes.push({
                    type: 'p',
                    text: line
                });
            } else {
                nodes.push({
                    type: 'br'
                });
            }
        }
    });

    // console.log(JSON.stringify(nodes, null, 4))

    return nodes;
}

var lines = {
    h1: /^# (.+)$/,
    tab: /^    (\S.+)$/,
    footnote: /^\[\^([^\]]+)\]:\s*(.*)$/, // "[^id1]: ..."
    footnote_tab: /^        (\S.+)$/,
};

var lines_id = Object.keys(lines);

function detectLine(line) {
    var match;
    var line_id = lines_id.find(line_id => {
        return match = line.match(lines[line_id]);
    });
    if (line_id) {
        return {
            id: line_id,
            match: match
        };
    } else {
        return {
            id: null,
            match: null
        };
    }
}

module.exports = {
    DocumentFile
};
