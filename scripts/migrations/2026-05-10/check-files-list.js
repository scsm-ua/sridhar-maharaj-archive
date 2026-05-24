// Compare files by name from config.output and config.output-with-footnotes to find difference

const path = require('path');
const fs = require('fs');

const config = require('./config.json');

const ROOT = path.resolve(__dirname, '../../..');
const outputDir = path.join(ROOT, config['output']);
const outputWithFootnotesDir = path.join(ROOT, config['output-with-footnotes']);

function collectFiles(dir) {
    const result = new Set();
    function walk(current) {
        const entries = fs.readdirSync(current, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(current, entry.name);
            if (entry.isDirectory()) {
                if (entry.name === 'notes') continue;
                walk(fullPath);
            } else if (entry.name.endsWith('.md')) {
                result.add(path.relative(dir, fullPath));
            }
        }
    }
    walk(dir);
    return result;
}

const outputFiles = collectFiles(outputDir);
const withFootnotesFiles = collectFiles(outputWithFootnotesDir);

const onlyInOutput = [...outputFiles].filter(f => !withFootnotesFiles.has(f));
const onlyInWithFootnotes = [...withFootnotesFiles].filter(f => !outputFiles.has(f));

console.log(`"${config['output']}": ${outputFiles.size} files`);
console.log(`"${config['output-with-footnotes']}": ${withFootnotesFiles.size} files`);

if (onlyInOutput.length === 0 && onlyInWithFootnotes.length === 0) {
    console.log('No differences found. Both directories have the same files.');
} else {
    if (onlyInOutput.length > 0) {
        console.log(`\nOnly in "${config['output']}" (${onlyInOutput.length}):`);
        onlyInOutput.forEach(f => console.log(' ', f));
    }
    if (onlyInWithFootnotes.length > 0) {
        console.log(`\nOnly in "${config['output-with-footnotes']}" (${onlyInWithFootnotes.length}):`);
        onlyInWithFootnotes.forEach(f => console.log(' ', f));
    }
}
