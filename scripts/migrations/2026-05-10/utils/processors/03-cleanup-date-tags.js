const { warn } = require('../warnings');

// Matches tags like "1985.05", "1985.05.01", etc.
const date_tag_re = /^\d{4}\.\d{2}/;

function cleanupDateTags(doc) {
    const tags = doc.meta && doc.meta.tags;
    if (!Array.isArray(tags)) return;

    const record_id = doc.meta.record_id || '';

    doc.meta.tags = tags.filter(tag => {
        const title = tag && tag.title;
        if (typeof title !== 'string' || !date_tag_re.test(title)) return true;

        if (!record_id.startsWith(title)) {
            warn('date-tags', `tag title "${title}" does not match record_id "${record_id}"`, doc.filename);
        }

        return false;
    });

    if (doc.meta.tags.length === 0) {
        delete doc.meta.tags;
    }
}

module.exports = { cleanupDateTags };
