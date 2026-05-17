const { warn } = require('../warnings');

const ref_re = /(\[\^[^\]]+\])(\:?)/g;

function fixFootnotesSyntax(doc) {
    let lines = doc.text.split('\n');
    const refs_dict = {};
    let footnotes_mode = false;
    lines = lines.map((line, idx) => {
        for (const ref_m of line.matchAll(ref_re)) {
            const footnote_id = ref_m[1];
            let footnote_body = ref_m[2];
            const ref_item = refs_dict[footnote_id] = refs_dict[footnote_id] || {
                links: 0
            };
            const idx = line.indexOf(footnote_id);

            if (!footnote_body && idx === 0 && ref_item.links > 0) {
                line = line.replace(footnote_id, footnote_id + ':');

                footnote_body = true;
            }

            if (idx === 0 && footnote_body) {
                footnotes_mode = true;
                ref_item.body = true;
            } else {
                ref_item.links++;
            }
        }

        return line;
    });

    doc.text = lines.join('\n');
}

module.exports = { fixFootnotesSyntax };
