const fs = require('fs');
const path = require('path');

// group -> Array of { message, filename }
const warnings = {};

function warn(group, message, filename) {
    if (!warnings[group]) warnings[group] = [];
    warnings[group].push({ message, filename });
    // Console: message + clickable path for cmd+click in VS Code terminal
    // console.warn(`WARNING [${group}]: ${message}\n  ${filename}`);
}

function writeWarnings(warningsDir, inputDir, outputFilesDir) {
    for (const [group, entries] of Object.entries(warnings)) {
        const lines = [`# Warnings: ${group}\n`];
        for (const { message, filename } of entries) {
            const rel_in = path.relative(warningsDir, filename);
            const rel_out = path.relative(warningsDir, path.join(outputFilesDir, path.relative(inputDir, filename)));
            lines.push(` - ${message}`);
            lines.push(`   - ${path.basename(filename)}`);
            lines.push(`   - [source](${rel_in})`);
            lines.push(`   - [output](${rel_out})`);
        }
        const outPath = path.join(warningsDir, `warnings-${group}.md`);
        fs.mkdirSync(warningsDir, { recursive: true });
        fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
        console.log(`Warnings written to ${outPath}`);
    }
}

module.exports = { warn, writeWarnings };
