const title_re = /^# (.+)\n?\n?/m;

function extractTitle(doc) {
    const match = doc.text.match(title_re);
    if (match) {
        const title = match[1].trim();
        const indexMatch = title.match(/^(\d+)\.\s*/);
        const title2 = indexMatch ? title.slice(indexMatch[0].length) : title;
        doc.meta.legacy = { ...doc.meta.legacy, ...{title: doc.meta.legacy?.title || title}, ...(indexMatch && { index: indexMatch[1] }) };
        doc.meta.title = title2;
        doc.text = doc.text.replace(title_re, '').replace(/^\n+/, '');
    } else {
        console.log('NO MATCH in', doc.filename);
        console.log('text bytes:', JSON.stringify(doc.text.slice(0, 100)));
    }
}

module.exports = { extractTitle };
