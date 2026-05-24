function renameAudioMp3ToSrc(doc) {
    if (!doc.meta || !doc.meta.audio) return;
    if (!Object.prototype.hasOwnProperty.call(doc.meta.audio, 'mp3')) return;

    doc.meta.audio.src = doc.meta.audio.mp3;
    delete doc.meta.audio.mp3;
}

module.exports = { renameAudioMp3ToSrc };
