var fs = require('fs');
const { FilesFactory } = require('./lib/classes/FilesFactory');

var nameArg = process.argv[2];
var pattern = nameArg
    ? new RegExp(nameArg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '.*\\.md$')
    : /\.md$/;

var factory = new FilesFactory('../docs/ru-no-footnotes', '../docs/ru', pattern);
// var factory = new FilesFactory('../docs/ru-no-footnotes', '../docs/ru', /28-molitvy-i-umonastroenie-gopi\/482-1982-06-19-b6-c1-molitvy-gopi-v-razluke-raznoobraznye-smysly-stiha-tava-kathamritam\.md$/);
factory.start();

var result = factory.renderAllFootnotes();
fs.writeFileSync('./footnotes.md', result);

var result2 = factory.renderAllFootnotesJson();
fs.writeFileSync('./footnotes.json', JSON.stringify(result2, null, 2));

factory.writeFootnoteFiles();

factory.writeDocFiles();


if (!nameArg) {
  const tags = Object.keys(factory.tags).sort().reduce(
      (obj, key) => { 
        obj[key] = factory.tags[key]; 
        return obj;
      }, 
      {}
  );
  fs.writeFileSync('../docs/tags.json', JSON.stringify(tags, null, 4));
  fs.writeFileSync('../docs/stats.json', JSON.stringify(factory.scripturesStats, null, 4));
}
