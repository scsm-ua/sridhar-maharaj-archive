function extractDate(doc) {
    if (!doc.meta.record_id) return;

    const m = doc.meta.record_id.match(/^(\d{4})\.(\d{2})\.(\d{2})/);
    if (m) {
        doc.meta.date = `${m[1]}-${m[2]}-${m[3]}`;
    }
}

module.exports = { extractDate };
