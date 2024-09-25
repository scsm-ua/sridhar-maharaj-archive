var fs = require('fs');
const { iterateFiles } = require("./lib/iterate-files");
const { DocumentFile } = require('./lib/classes/DocumentFile');
const { analyzeFootnotes2 } = require('./lib/classes/Footnote');

var result = '';

iterateFiles('../docs', /\.md$/, function(o) {
    
// iterateFiles('../docs', /ru\/28-molitvy-i-umonastroenie-gopi\/482-1982-06-19-b6-c1-molitvy-gopi-v-razluke-raznoobraznye-smysly-stiha-tava-kathamritam\.md$/, function(o) {
    
    var { filename, content } = o;

    var doc = new DocumentFile(filename, content);

    // result += doc.renderFootnotes();
    

    // result += analyzeFootnotes(filename, content);

});

// console.log(result);

// fs.writeFileSync('./footnotes.md', result);

// analyzeFootnotes2();

