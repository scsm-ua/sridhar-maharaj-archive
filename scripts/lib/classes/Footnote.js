var all_footnotes = [];

var SCRIPTURES = {
    "шветашватара упанишад": 1,
    "бхакти расамрита синдху": 1,
    "веданта сутра": 1,
    "ману самхита": 1,
    "шримад бхагаватам": 1,
    "бхагавад гита": "Бхагавад-гита",
    "шри шикшаштакам": 1,
    "шри гита говинда": 1,
    "шри шикшаштака": 1,
    "риг веда": 1,
    "брахма самхита": 1,
    "гита мала": 1,
    "катха упанишад": 1,
    "бхакти сандарбха": 1,
    "хитопадеша": 1,
    "шад госвами аштака": 1,
    "чайтанья чаритамрита антья лила": 1,
    "чайтанья чаритамрита мадхья лила": 1,
    "чайтанья чаритамрита ади лила": 1,
    "поиск шри кришны": 1,
    "падьявали шрилы рупы госвами": 1,
    "шрила джаядев госвами гита говинда": 1,
    "гоптритве варана шрилы бхактивинода тхакура": 1,
    "шрила бхактивинод тхакур шаранагати": 1,
    "рагхунатх дас госвами вилапа кусуманджали": 1,
    "шри кришнера аштоттара шата нама": 1,
    "бхаджана рахасья вритти": 1,
    "према виварта": 1,
    "падма пурана уттара кханда": 1,
    "падма пурана уттара кханда": 1,
    "према дхама дева стотрам": 1,
    "шрила бхактивинод тхакур гитамала ямуна бхававали": 1,
    "шри таттва сандарбха шрилы дживы госвами": 1,
    "радха раса судха нидхи": 1,

    //---
    "тайттирия упанишад": 1,
    "чхандогья упанишад": 1
    
};

var SCRIPTURES_SETS = Object.keys(SCRIPTURES).map(s => new Set(s.split(' ')));
var SCRIPTURES_NAMES = Object.values(SCRIPTURES);

class Footnote {

    constructor(documentFile, nodes) {
        this.documentFile = documentFile;
        this.nodes = nodes;

        this.md = this.getMD();
        this.words_set = new Set(this.md.split(/[ ,\.\-"\(\)\[\]\/»«—\*\n\d]+/).filter(i => !!i && i.length > 2).map(s => s.toLowerCase()));
        this.words_str = [...this.words_set].join(' ');

        var scripture_number_match = this.md.match(/\d+(\.\d+)*/);
        if (scripture_number_match) {
            this.scripture_number_str = scripture_number_match[0];
        }

        all_footnotes.push(this);

        var scriptureName = this.getScriptureName();
        if (typeof scriptureName === 'string') {
            console.log(scriptureName, this.scripture_number_str)
        }
    }

    getScriptureName() {
        if (SCRIPTURES[this.words_str]) {
            return SCRIPTURES[this.words_str];
        }

        var match_scripture = SCRIPTURES_NAMES.find((name, idx) => {
            var s = SCRIPTURES_SETS[idx];
            return s.intersection(this.words_set).size === s.size;
        });

        return match_scripture;
    }

    getMD() {
        var md = '';
    
        this.nodes.forEach(node => {
            switch(node.type) {
                case "footnote":
                case "p":
                    md += node.text  + '\n';
                    break;
                case "code":
                    md += '    ' + node.text  + '\n';
                    break;
                case "br":
                    md += '\n';
                    break;
            }
        });
    
        return md;
    }

    renderDebug() {
        return '# ' + this.nodes[0].id + '\n\n' + this.md;
    }
}

function analyzeFootnotes2()  {
    for(var i = 0; i < all_footnotes.length; i++) {
        var f1 = all_footnotes[i];
        if (f1.similar) {
            continue;
        }

        for(var j = i + 1; j < all_footnotes.length; j++) {
            var f2 = all_footnotes[j];
            if (f2.similar) {
                continue;
            }

            var ins = f1.words_set.intersection(f2.words_set);
            var f1p = ins.size / f1.words_set.size;
            var f2p = ins.size / f2.words_set.size;

            if (f1p > 0.5 && f2p > 0.5 && f1.words_set.size > 2 && f2.words_set.size > 2) {
                console.log('i', i, j, all_footnotes.length);
                console.log('=================', f1.words_set.size, f2.words_set.size, ins.size, f1p, f2p);
                // console.log('=================', f1.words_set, f2.words_set, ins);
                console.log(f1.md)
                console.log('----');
                console.log(f2.md);

                f2.similar = true;
            }
        }
    }
};


module.exports = {
    Footnote,
    analyzeFootnotes2
};
