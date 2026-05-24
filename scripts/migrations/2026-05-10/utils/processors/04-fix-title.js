const { warn } = require('../warnings');

// A title containing ". " is treated as multi-sentence.
const multi_sentence_re = /\.\s/;

function fixTitle(doc) {
    if (!doc.meta || typeof doc.meta.title !== 'string') return;

    let title = doc.meta.title;

    // Collapse multiple consecutive spaces into one.
    title = title.replace(/ {2,}/g, ' ').trim();

    const isMultiSentence = multi_sentence_re.test(title);

    if (isMultiSentence) {
        // Multi-sentence titles must end with a dot.
        if (!title.endsWith('.')) {
            title = title + '.';
        }
    } else {
        // Single-sentence titles must not end with a dot.
        if (title.endsWith('.')) {
            title = title.slice(0, -1);
        }
    }

    doc.meta.title = title;
}

module.exports = { fixTitle };
