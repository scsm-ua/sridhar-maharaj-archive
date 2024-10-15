var fs = require('fs');
const { FilesFactory } = require('./lib/classes/FilesFactory');

var factory = new FilesFactory('../docs/ru-no-footnotes', '../docs/ru', /\.md$/);
// var factory = new FilesFactory('../docs/ru-no-footnotes', '../docs/ru', /28-molitvy-i-umonastroenie-gopi\/482-1982-06-19-b6-c1-molitvy-gopi-v-razluke-raznoobraznye-smysly-stiha-tava-kathamritam\.md$/);
factory.start();

var result = factory.renderAllFootnotes();
fs.writeFileSync('./footnotes.md', result);

factory.writeFootnoteFiles();

factory.writeDocFiles();

const tags = Object.keys(factory.tags).sort().reduce(
    (obj, key) => { 
      obj[key] = factory.tags[key]; 
      return obj;
    }, 
    {}
);

fs.writeFileSync('../docs/tags.json', JSON.stringify(tags, null, 4));
