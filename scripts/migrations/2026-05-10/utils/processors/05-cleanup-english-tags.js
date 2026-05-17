const { warn } = require('../warnings');

// Matches tags containing any ASCII letter (a-z, A-Z)
const english_letter_re = /[a-zA-Z]/;
const exact_remove_tags = ['дата неизвестна'];

function cleanupEnglishTags(doc) {
    const tags = doc.meta && doc.meta.tags;
    if (!Array.isArray(tags)) return;

    doc.meta.tags = tags.filter(tag => {
        const title = tag && tag.title;
        if (typeof title !== 'string') return true;

        if (exact_remove_tags.includes(title)) return false;

        if (!english_letter_re.test(title)) return true;

        warn('english-tags', `removing tag with english letters: "${title}"`, doc.filename);

        return false;
    });

    if (doc.meta.tags.length === 0) {
        delete doc.meta.tags;
    }
}

module.exports = { cleanupEnglishTags };
