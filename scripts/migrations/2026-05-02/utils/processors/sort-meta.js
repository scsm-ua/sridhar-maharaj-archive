const KEY_ORDER = ['slug', 'record_id', 'title', 'author', 'lang', 'audio', 'date', 'category', 'tags', 'links', 'legacy'];

function sortMeta(doc) {
    const sorted = {};
    for (const key of KEY_ORDER) {
        if (key in doc.meta) sorted[key] = doc.meta[key];
    }
    // append any remaining keys not in KEY_ORDER
    for (const key of Object.keys(doc.meta)) {
        if (!(key in sorted)) sorted[key] = doc.meta[key];
    }
    doc.meta = sorted;
}

module.exports = { sortMeta, KEY_ORDER };
