var fs = require('fs');
const { DocumentFile } = require('./DocumentFile');
const { FootnoteFile } = require('./FootnoteFile');

var scripturesUsageFix = {
    'Бхагавад-гита': 2000,
    'Шримад-Бхагаватам': 1000
};

function fixScripturePriority(name, usageCount) {
    return usageCount + (scripturesUsageFix[name] || 0);
}

class FilesFactory {

    constructor(root, filename_re) {
        this.root = root;
        this.filename_re = filename_re;
        this.documents = [];
        this.footnotes = [];
        this.scripturesUsage = {};
        this.scripturesVersesUsage = {};
        this.scripturesUsageByVerses = {};
        this.footnotesFiles = {};
        this.footnotesDir = this.root + '/notes/';
    }

    start() {
        this.iterateFiles(this.root, this.filename_re, file => {     
            var { filename, content } = file;
            var doc = new DocumentFile(this, filename, content);
            this.documents.push(doc);
        });

        this.createFootnoteFiles();
    }

    createFootnoteFiles() {

        // TOOD: render stats

        var sortedScripturesUsage = Object.entries(this.scripturesUsage);
        sortedScripturesUsage.sort((a, b) => b[1] - a[1]);
        console.log(sortedScripturesUsage)

        var sortedScripturesVersesUsage = Object.entries(this.scripturesVersesUsage);
        sortedScripturesVersesUsage.sort((a, b) => b[1] - a[1]);
        // console.log(sortedScripturesVersesUsage)

        var scripturesByUniqueVerses = Object.entries(this.scripturesUsageByVerses).map(([scripture, verses]) => {
            return [
                scripture,
                Object.keys(verses).length
            ];
        });
        scripturesByUniqueVerses.sort((a, b) => b[1] - a[1]);
        // console.log(scripturesByUniqueVerses)
        // console.log(this.scripturesUsageByVerses)

        this.footnotes.forEach(footnote => {

            var usedScriptures = [];

            (footnote.getUsedScripturesWithNamesItems() || []).forEach(item => {
                // TODO: test variatons by verses count.
                usedScriptures.push([item.name, item.number, fixScripturePriority(this.scripturesUsage[item.name])]);
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
                        this.footnotesDir
                    );
                }
                var footnoteFile = this.footnotesFiles[scriptureNameWithNumber];
                footnoteFile.addFootnote(footnote);
            }
        })
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
            fs.writeFileSync(dir + footnoteFile.getFileSlug() + '.md', md);
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
}

module.exports = {
    FilesFactory
};
