const path = require('path');
const mp3DataPath = path.join(__dirname, '../../mp3-data.json');
const mp3Data = require(mp3DataPath);

function extractAudio(doc) {
    const links = doc.meta.links;
    if (!Array.isArray(links)) return;

    const mp3Link = links.find(link => link.href && link.href.endsWith('.mp3'));
    if (mp3Link) {
        const audio = {};
        const data = mp3Data[mp3Link.href];
        if (data) {
            if (data.totalSize != null) audio.bytes = data.totalSize;
            if (data.duration != null) audio.duration = data.duration;
        } else {
            console.warn('No mp3 data found for', mp3Link.href, 'in', doc.filename);
        }
        audio.mp3 = mp3Link.href;
        doc.meta.audio = audio;
    } else {
        console.warn('No mp3 link found in', doc.filename);
    }
}

module.exports = { extractAudio };
