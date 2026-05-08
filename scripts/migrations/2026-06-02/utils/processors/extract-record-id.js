const { warn } = require('../warnings');

// Matches YYYY.MM.DD followed by one or more segments of .<letter>\d
// Letter can be any Latin or Cyrillic single char; Cyrillics are normalized to Latin
const record_id_re = /1\d{3}\.\d{2}\.\d{2}(?:\.(?:[A-ZА-Яa-zа-я]r?\d{0,2}|\d+))*/u;

const cyrillicToLatin = { 'А': 'A', 'В': 'B', 'С': 'C', 'Е': 'E', 'а': 'A', 'в': 'B', 'с': 'C', 'е': 'E' };

function normalizeRecordId(id) {
    return id.replace(/[А-Яа-я]/gu, ch => cyrillicToLatin[ch] || ch);
}

function extractRecordId(doc) {
    const match = doc.meta.title && doc.meta.title.match(record_id_re);
    if (match) {
        const normalized = normalizeRecordId(match[0]);
        // warn if any letter segment is outside a-e
        const segments = normalized.replace(/^\d{4}\.\d{2}\.\d{2}\.?/, '').split('.');
        for (const seg of segments) {
            if (seg) {
                if (/^\d+$/.test(seg)) {
                    // warn('record_id', `digit-only segment ".${seg}" in record_id "${normalized}"`, doc.filename);
                } else {
                    const letter = seg[0].toUpperCase();
                    if (letter < 'A' || letter > 'E') {
                        warn('record_id', `unexpected letter "${letter}" in record_id "${normalized}"`, doc.filename);
                    }
                }
            }
        }
        doc.meta.record_id = normalized;
        // remove record_id (and any trailing dot) from title, keep legacy.title intact
        doc.meta.title = doc.meta.title.replace(match[0], '').replace(/^[\s.]+/, '').replace(/\s+/g, ' ').trim();
    }

    if (doc.meta.title) {
        doc.meta.title = doc.meta.title.replace(/\s+/g, ' ').trim();
    }

    // If title begins with (...), extract it to meta.legacy.comment
    if (doc.meta.title) {
        const comment_match = doc.meta.title.match(/^(\([^)]+\))[\s.]*/);
        if (comment_match) {
            doc.meta.legacy = { ...doc.meta.legacy, comment: comment_match[1] };
            doc.meta.title = doc.meta.title.slice(comment_match[0].length).trim();
        }
    }

    // warn if title contains a parenthesized segment like (A1) that looks like a record_id part
    const paren_re = /\([A-ZА-Яa-zа-я]r?\d{0,2}\)/u;
    if (doc.meta.title && paren_re.test(doc.meta.title)) {
        warn('record_id', `title contains parenthesized segment: "${doc.meta.title.match(paren_re)[0]}"`, doc.filename);
    }

    if (doc.meta.title && doc.meta.title.includes('+')) {
        warn('record_id', `title contains "+"`, doc.filename);
    }

    if (!doc.meta.record_id) {
        // warn if title contains a partial date like YYYY.MM or YYYY (but not a full YYYY.MM.DD)
        const partial_date_re = /\b(1\d{3}\.\d{2}(?!\.\d{2})|\b1\d{3}(?!\.\d{2}))\b/;
        if (doc.meta.title && partial_date_re.test(doc.meta.title)) {
            warn('record_id', `title contains partial date: "${doc.meta.title.match(partial_date_re)[0]}"`, doc.filename);
        }
    }

    if (!doc.meta.record_id) {
        // check if a YYYY-style date appears in slug or tags, warn as implicit record_id
        const year_re = /\b19\d{2}\b/;
        const suspects = [
            doc.meta.slug,
            ...(doc.meta.tags || []).map(t => t.title),
            ...(doc.meta.tags || []).map(t => t.slug),
        ].filter(Boolean);
        let foundImplicit = false;
        for (const val of suspects) {
            if (year_re.test(val)) {
                warn('record_id_implicit', `possible implicit record_id year in "${val}"`, doc.filename);
                foundImplicit = true;
                break;
            }
        }
        if (!foundImplicit && doc.meta.record_id !== null) {
            // warn('record_id', 'no record_id found in title', doc.filename);
        }
    }

    if (doc.meta.record_id && /[А-Яа-я]/u.test(doc.meta.record_id)) {
        warn('record_id', `record_id contains Cyrillic characters: "${doc.meta.record_id}"`, doc.filename);
    }
}

module.exports = { extractRecordId };
