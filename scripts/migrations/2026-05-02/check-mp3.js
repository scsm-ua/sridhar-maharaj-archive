'use strict';

const path = require('path');
const fs = require('fs');
const { parse } = require('yaml');
const { probeRemoteMp3 } = require('./utils/probe-mp3');
const { iterateFiles } = require('../../lib/iterate-files');

const config = require('./config.json');

const ROOT = path.resolve(__dirname, '../../..');
const inputDir = path.join(ROOT, config.input);
const mp3Base = config.mp3_base;

// Options:
//   node check-mp3.js           — check all mp3s
//   node check-mp3.js 10        — check first 10 mp3s
//   node check-mp3.js --errors  — re-check only entries from mp3-errors.json
const ERRORS_ONLY = process.argv.includes('--errors');
const LIMIT = !ERRORS_ONLY && process.argv[2] ? parseInt(process.argv[2], 10) : null;

const errorsPath = path.join(__dirname, 'mp3-errors.json');

const yml_re = /^---(.|\n)+---(\s|\n)+/m;

async function main() {
    let mp3Paths = [];

    if (ERRORS_ONLY) {
        if (!fs.existsSync(errorsPath)) {
            console.error('mp3-errors.json not found. Run without --errors first.');
            process.exit(1);
        }
        const errorsData = JSON.parse(fs.readFileSync(errorsPath, 'utf8'));
        mp3Paths = Object.keys(errorsData);
        console.log(`Re-checking ${mp3Paths.length} entries from mp3-errors.json...`);
    } else {
        iterateFiles(inputDir, /\.md$/, ({ filename, content }) => {
            const ymlMatch = content.match(yml_re);
            if (!ymlMatch) return;
            const ymlPart = ymlMatch[0].replace(/^---\n*/m, '').replace(/\n*---\n*$/m, '');
            const meta = parse(ymlPart);

            const links = meta.links;
            if (!Array.isArray(links)) return;
            const mp3Link = links.find(link => link.href && link.href.endsWith('.mp3'));
            if (mp3Link) {
                mp3Paths.push(mp3Link.href);
            }
        });
    }

    const toCheck = LIMIT ? mp3Paths.slice(0, LIMIT) : mp3Paths;
    if (!ERRORS_ONLY) console.log(`Checking ${toCheck.length} of ${mp3Paths.length} mp3 files...`);
    console.log(`Checking ${toCheck.length} of ${mp3Paths.length} mp3 files...`);

    const results = {};
    const errors = {};
    for (const relativePath of toCheck) {
        const url = mp3Base + relativePath;
        console.log('Probing:', url);
        const result = await probeRemoteMp3(url);
        results[relativePath] = result;
        if (result.error || (result.status && result.status >= 400)) {
            errors[relativePath] = result;
        }
    }

    const outputPath = path.join(__dirname, 'mp3-data.json');
    if (ERRORS_ONLY && fs.existsSync(outputPath)) {
        const existing = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
        const merged = { ...existing, ...results };
        fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2), 'utf8');
        console.log(`Updated ${Object.keys(results).length} entries in mp3-data.json`);
    } else {
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
        console.log(`Saved ${Object.keys(results).length} entries to mp3-data.json`);
    }

    fs.writeFileSync(errorsPath, JSON.stringify(errors, null, 2), 'utf8');
    console.log(`Saved ${Object.keys(errors).length} errors to mp3-errors.json`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
