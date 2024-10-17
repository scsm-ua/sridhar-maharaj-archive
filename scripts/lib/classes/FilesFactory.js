var fs = require('fs');
const { DocumentFile } = require('./DocumentFile');
const { FootnoteFile } = require('./FootnoteFile');
const { dirname } = require('path');

var scripturesUsageFix = {
    'Бхагавад-гита': 2000,
    'Шримад-Бхагаватам': 1000
};

function fixScripturePriority(name, usageCount) {
    return usageCount + (scripturesUsageFix[name] || 0);
}

var debugCount = 1;

class FilesFactory {

    constructor(source_root, target_root, filename_re) {
        this.source_root = source_root;
        this.target_root = target_root;
        this.filename_re = filename_re;
        this.documents = [];
        this.footnotes = [];
        this.scripturesUsage = {};
        this.scripturesVersesUsage = {};
        this.scripturesUsageByVerses = {};
        this.footnotesFiles = {};
        this.footnotesDir = this.target_root + '/notes';
        this.scripturesStats = {};
    }

    start() {
        this.iterateFiles(this.source_root, this.filename_re, file => {     
            var { filename, content } = file;
            filename = filename.replace(this.source_root, this.target_root);
            var doc = new DocumentFile(this, filename, content);
            this.documents.push(doc);
        });

        this.createFootnoteFiles();

        // analyzeFootnotes2(this.footnotes);
    }

    createFootnoteFiles() {

        // TOOD: render stats

        var sortedScripturesUsage = Object.entries(this.scripturesUsage);
        sortedScripturesUsage.sort((a, b) => b[1] - a[1]);
        this.scripturesStats['usageByName'] = Object.fromEntries(sortedScripturesUsage);
        // console.log(this.scripturesStats['usageByName']);

        var sortedScripturesVersesUsage = Object.entries(this.scripturesVersesUsage);
        sortedScripturesVersesUsage.sort((a, b) => b[1] - a[1]);
        this.scripturesStats['usageByVerse'] = Object.fromEntries(sortedScripturesVersesUsage);
        // console.log(this.scripturesStats['usageByVerse'])

        var scripturesByUniqueVerses = Object.entries(this.scripturesUsageByVerses).map(([scripture, verses]) => {
            return [
                scripture,
                Object.keys(verses).length
            ];
        });
        scripturesByUniqueVerses.sort((a, b) => b[1] - a[1]);
        this.scripturesStats['quotedVerses'] = Object.fromEntries(scripturesByUniqueVerses);
        // console.log(this.scripturesStats['quotedVerses'])


        this.footnotes.forEach(footnote => {

            // console.log('---');
            // console.log(footnote.md);
            // console.log(Array.from(footnote.words_set).join(' '));
            
            // console.log(footnote.scriptureNumbers);
            // console.log(footnote.scriptureNames);
            // console.log(footnote.shloka);

            var usedScriptures = [];

            (footnote.getUsedScripturesWithNamesItems() || []).forEach(item => {
                // TODO: test variatons by verses count.
                usedScriptures.push([item.name, item.number, fixScripturePriority(item.name, this.scripturesUsage[item.name])]);
            });
            if (usedScriptures.length > 0) {
                // Sort by usage.
                usedScriptures.sort((a, b) => b[2] - a[2]);
                var scriptureName = usedScriptures[0][0];
                var scriptureVerse = usedScriptures[0][1];

                var scriptureNameWithNumber = `${scriptureName} ${scriptureVerse}`;
    
                if (!this.footnotesFiles[scriptureNameWithNumber]) {
                    this.footnotesFiles[scriptureNameWithNumber] = new FootnoteFile(
                        scriptureName, 
                        scriptureNameWithNumber, 
                        scriptureNameWithNumber, 
                        this.footnotesDir
                    );
                }
                var footnoteFile = this.footnotesFiles[scriptureNameWithNumber];
                footnoteFile.addFootnote(footnote);

            } else if (footnote.shloka) {
                
                if (!this.footnotesFiles[footnote.shloka]) {
                    this.footnotesFiles[footnote.shloka] = new FootnoteFile(
                        'shloka', 
                        null, 
                        footnote.shloka.split(/[\s‑—–-]/).slice(0, 5).join(' '), 
                        this.footnotesDir
                    );
                }
                var footnoteFile = this.footnotesFiles[footnote.shloka];
                footnoteFile.addFootnote(footnote);
            }
        });
    }

    addFootnote(footnote) {
        this.footnotes.push(footnote);

        (footnote.getUsedScripturesNames() || []).forEach(name => {
            this.scripturesUsage[name] = (this.scripturesUsage[name] || 0) + 1;
        });

        (footnote.getUsedScripturesNamesWithNubmers() || []).forEach(name => {
            this.scripturesVersesUsage[name] = (this.scripturesVersesUsage[name] || 0) + 1;
        });

        (footnote.getUsedScripturesWithNamesItems() || []).forEach(item => {
            var group = this.scripturesUsageByVerses[item.name] = this.scripturesUsageByVerses[item.name] || {};
            group[item.number] = (group[item.number] || 0) + 1;
        });
        
    }

    renderFootnoteFiles() {
        var r = '';
        for(var key in this.footnotesFiles) {
            r += '\n=========\n';
            r += key;
            r += '\n=========\n';
            r += this.footnotesFiles[key].getSlug()
            r += '\n=========\n';
            r += this.footnotesFiles[key].renderFile();
        }
        return r;
    }

    writeFootnoteFiles() {
        for(var key in this.footnotesFiles) {
            var footnoteFile = this.footnotesFiles[key];
            var md = footnoteFile.renderFile();
            var dir = footnoteFile.getDir();
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(footnoteFile.getFullFilename(), md);
        }
    }

    renderAllFootnotes() {
        var r = '';
        this.documents.forEach(d => {
            r += d.renderFootnotes();
        });
        return r;
    }

    iterateFiles(dir, filename_re, cb) {

        var count = 0;
        var current_file_idx = 0;
    
        function processFile(filepath, count_files) {
            if (!filename_re.test(filepath)) {
                return;
            }
            if (count_files) {
                count++;
            } else {
                current_file_idx++;
    
                var log_step = Math.round(count / 10);
    
                if (current_file_idx % log_step === 0) {
                    console.log('- Progress', Math.round(100 * current_file_idx / count) + '%', current_file_idx, 'of', count)
                }
    
                var content = fs.readFileSync(filepath, 'utf8');
    
                cb({
                    filename: filepath,
                    content: content
                });
            }
        }
        
        function processDir(start, count_files) {
            fs.readdirSync(start).forEach(file => {
                var path = start + '/' + file;
                var stats = fs.statSync(path);
                if (stats.isDirectory()) {
                    processDir(path, count_files);
                } else {
                    processFile(path, count_files);
                }
            });
        }
        
        processDir(dir, true);
        processDir(dir);
    }

    writeDocFiles() {

        this.tags = {};

        this.documents.forEach(doc => {
            var md = doc.renderFile();
            // var filename = doc.filename.replace('/ru/', '/ru-2/');
            // var dir = dirname(filename);
            // if (!fs.existsSync(dir)) {
            //     fs.mkdirSync(dir, { recursive: true });
            // }
            fs.writeFileSync(doc.filename, md);

            (doc.meta.tags || []).forEach(t => {
                this.tags[t.slug] = t.title;
            });
        });
    }
}

var quotes_dict = {};

function extractStartQuote(text) {
    var m = text.match(/^\*[^\*]+\*/);
    if (m) {
        return m[0].toLowerCase();
    }
}

function analyzeFootnotes2(all_footnotes)  {
    for(var i = 0; i < all_footnotes.length; i++) {
        var f1 = all_footnotes[i];
        // if (f1.file) {
        //     continue;
        // }

        for(var j = i + 1; j < all_footnotes.length; j++) {
            var f2 = all_footnotes[j];
            if (f2.file || f2.similar) {
                continue;
            }

            var ins = f1.words_set.intersection(f2.words_set);
            var f1p = ins.size / f1.words_set.size;
            var f2p = ins.size / f2.words_set.size;

            if (f1p > 0.5 && f2p > 0.5 && f1.words_set.size > 2 && f2.words_set.size > 2 && (!f1.file || !f2.file)) {

                console.log('i', debugCount++, i, j, all_footnotes.length);
                console.log('=================', f1.words_set.size, f2.words_set.size, ins.size, f1p, f2p);
                // console.log('=================', f1.words_set, f2.words_set, ins);
                console.log(f1.md)
                console.log('----');
                console.log(f2.md);

                // var q1 = extractStartQuote(f1.md);
                // var q2 = extractStartQuote(f2.md);

                // quotes_dict[q1] = (quotes_dict[q1] || 0) + 1;
                // quotes_dict[q2] = (quotes_dict[q2] || 0) + 1;

                // if (!q1 && !q2) {
                //     console.log('i', debugCount++, i, j, all_footnotes.length);
                //     console.log(f2.md);
                //     console.log(f2.md);
                // }

                // f2.similar = true;
            }
        }
    }
    // console.log(Object.keys(quotes_dict).length, quotes_dict)
};

module.exports = {
    FilesFactory
};
