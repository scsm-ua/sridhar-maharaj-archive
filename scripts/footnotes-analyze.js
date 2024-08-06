var fs = require('fs');
const { iterateFiles } = require("./lib/iterate-files");
const { analyzeFootnotes } = require("./lib/parse-doc");

var result = '';

iterateFiles('../docs', /\.md$/, function(o) {
    
//iterateFiles('../docs', /ru\/28-molitvy-i-umonastroenie-gopi\/482-1982-06-19-b6-c1-molitvy-gopi-v-razluke-raznoobraznye-smysly-stiha-tava-kathamritam\.md$/, function(o) {
    
    var { filename, content } = o;

    result += analyzeFootnotes(filename, content);

});

fs.writeFileSync('./footnotes.md', result);