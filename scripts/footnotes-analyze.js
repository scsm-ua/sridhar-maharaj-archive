var fs = require('fs');
const { FilesFactory } = require('./lib/classes/FilesFactory');
const { debug_dict } = require('./lib/classes/Footnote');

// /28-molitvy-i-umonastroenie-gopi\/482-1982-06-19-b6-c1-molitvy-gopi-v-razluke-raznoobraznye-smysly-stiha-tava-kathamritam\.md$/

var factory = new FilesFactory('../docs/ru', /\.md$/);
// var factory = new FilesFactory('../docs/ru', /28-molitvy-i-umonastroenie-gopi\/482-1982-06-19-b6-c1-molitvy-gopi-v-razluke-raznoobraznye-smysly-stiha-tava-kathamritam\.md$/);
// var factory = new FilesFactory('../docs/ru', /39-ierarhiya-mirozdaniya-plany-bytiya\/654-1981-08-10-a1-otkrovenie-shri-chajtani-prevoshodit-vse-prochie-izmereniya.md$/);
// var factory = new FilesFactory('../docs/ru', /29-gayatri-mantra-i-mantra-om\/488-1983-11-12-a1-shridhar-maharadzh-v-podrobnostyah-obyasnyaet-svoyu-poemu-o-smysle-gayatri-a-govinda-maharadzh-tsitiruet.md$/);
factory.start();
var result = factory.renderAllFootnotes();

fs.writeFileSync('./footnotes.md', result);

// console.log(factory.renderFootnoteFiles());

factory.writeFootnoteFiles();

console.log(debug_dict);
