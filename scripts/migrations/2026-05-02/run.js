const path = require('path');
const fs = require('fs');

const config = require('./config.json');
const { iterateFiles } = require('../../lib/iterate-files');
const { Document } = require('./utils/Document');
const { writeWarnings } = require('./utils/warnings');

const ROOT = path.resolve(__dirname, '../../..');
const inputDir = path.join(ROOT, config.input);
const outputDir = path.join(ROOT, config.output);

iterateFiles(inputDir, /\.md$/, ({ filename, content }) => {
    const doc = new Document(filename, content);
    const rendered = doc.render();

    const relativePath = path.relative(inputDir, filename);
    const outputPath = path.join(outputDir, relativePath);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, rendered, 'utf8');
});

writeWarnings(path.join(__dirname, 'warnings'), inputDir, outputDir);
