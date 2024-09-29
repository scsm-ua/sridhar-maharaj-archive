var fs = require('fs');
const { DocumentFile } = require('./DocumentFile');
const { FootnoteFile } = require('./FootnoteFile');

class FilesFactory {

    constructor(root, filename_re) {
        this.root = root;
        this.filename_re = filename_re;
        this.documents = [];
        this.footnotes = [];
        this.footnotesFiles = {};
        this.footnotesDir = this.root + '/notes/';
    }

    start() {
        this.iterateFiles(this.root, this.filename_re, file => {     
            var { filename, content } = file;
            var doc = new DocumentFile(this, filename, content);
            this.documents.push(doc);
        });
    }

    addFootnote(footnote) {
        this.footnotes.push(footnote);

        var scriptureName = footnote.getScriptureName();
        var scriptureNameWithNumber = footnote.getScriptureNameWithNumber();
        if (scriptureNameWithNumber) {
            if (!this.footnotesFiles[scriptureNameWithNumber]) {
                this.footnotesFiles[scriptureNameWithNumber] = new FootnoteFile(scriptureNameWithNumber, scriptureName, this.footnotesDir);
            }
            var footnoteFile = this.footnotesFiles[scriptureNameWithNumber];
            footnoteFile.addFootnote(footnote);
        }
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
