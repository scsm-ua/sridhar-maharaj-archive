const { warn } = require('../warnings');

const ref_re = /(\[\^[^\]]+\])(\:?)/g;

function validateFootnotes(doc) {
    const lines = doc.text.split('\n');
    const refs_dict = {};
    let footnotes_mode = false;
    lines.forEach((line, idx) => {
        for (const ref_m of line.matchAll(ref_re)) {
            const footnote_id = ref_m[1];
            const footnote_body = ref_m[2];
            const ref_item = refs_dict[footnote_id] = refs_dict[footnote_id] || {
                links: 0
            };
            const idx = line.indexOf(footnote_id);
            if (idx === 0 && footnote_body) {
                footnotes_mode = true;
                // Body.
                if (ref_item.body) {
                    warn('footnotes', `duplicate body for footnote "${footnote_id}"`, doc.filename);
                }
                ref_item.body = true;
            } else {
                if (footnotes_mode) {
                    warn('footnotes', `footnote link "${footnote_id}" found after footnotes body section started`, doc.filename);
                }
                ref_item.links++;

            }
        }
    });

    Object.entries(refs_dict).forEach(([key, ref_item]) => {
        if (!ref_item.body) {
            warn('footnotes', `no body found for footnote "${key}"`, doc.filename);
        }
        if (ref_item.links === 0) {
            warn('footnotes', `no links found for footnote "${key}"`, doc.filename);
        }
        if (ref_item.links > 1) {
            if (ref_item.body) {
                warn('footnotes-multi-with-body', `more than 1 link found for footnote "${key}" (${ref_item.links})`, doc.filename);
            } else {
                warn('footnotes-multi-no-body', `more than 1 link found for footnote "${key}" (${ref_item.links})`, doc.filename);
            }
        }
    });         
}

module.exports = { validateFootnotes };
