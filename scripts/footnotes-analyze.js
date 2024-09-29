var fs = require('fs');
const { FilesFactory } = require('./lib/classes/FilesFactory');

// /28-molitvy-i-umonastroenie-gopi\/482-1982-06-19-b6-c1-molitvy-gopi-v-razluke-raznoobraznye-smysly-stiha-tava-kathamritam\.md$/

var factory = new FilesFactory('../docs/ru', /\.md$/);
factory.start();
var result = factory.renderAllFootnotes();

fs.writeFileSync('./footnotes.md', result);

// console.log(factory.renderFootnoteFiles());

factory.writeFootnoteFiles();
