/*

Convert verse blocks marked with bold (**) and line-continuation (\) to
4-space-indented code blocks. Five structural cases:

--- Case 0: single bold line with footnote ---

**ким̇ пунар бра̄хман̣ах̣ пун̣йа̄**[^7]

--- Case 1: single bold block, \ continuation INSIDE ---

**бахӯна̄м̇ джанмана̄м анте,\
джн̃а̄нава̄н ма̄м̇ прападйанте\
ва̄судевах̣ сарвам ити,\
са маха̄тма̄ су-дурлабхах̣**[^7]

--- Case 2: per-line bold, \ continuation OUTSIDE ---

**‘ке а̄ми’, ‘кене а̄ма̄йа джа̄ре та̄па-трайа’**\
**иха̄ на̄хи джа̄ни** — **‘кемане хита хайа’**[^_ftn1]

--- Case 3: optional leading bold lines + bracket-wrapped ending ---

**ваданти тат таттва-видас**\
**таттвам̇ йадж джн̃а̄нам адвайам**\
[**брахмети парама̄тмети**\
**бхагава̄н ити ш́абдйате**][^_ftn2]

--- All produce (footnote is optional) ---

    бахӯна̄м̇ джанмана̄м анте,
    джн̃а̄нава̄н ма̄м̇ прападйанте
    ва̄судевах̣ сарвам ити,
    са маха̄тма̄ су-дурлабхах̣
[^7]
--- Case 3 produces ---

    ваданти тат таттва-видас
    таттвам̇ йадж джн̃а̄нам адвайам
    [брахмети парама̄тмети
    бхагава̄н ити ш́абдйате]
[^_ftn2]
*/

// Case 0: single-line bold with a trailing footnote, occupying the full line.
// ^ and $ with /m ensure the bold block is the entire line, not inline.
//
// ^\\*\\*([^\\n*]+)\\*\\*           full-line bold text (no * or newline inside)
// ((?:\\[\\^[^\\]]+\\])+)$          one or more footnote refs [^id] at line end
const CASE0_RE = /^\*\*([^\n*]+)\*\*((?:\[\^[^\]]+\])+)$/mg;

// Case 1: one bold block wrapping all lines; `\` continuation is inside the block.
// Line content uses [^\n*]+ to avoid matching across ** markers of other cases.
//
// \*\*                   opening **
// (                      [1] full verse body (no * chars in line content)
//   (?:[^\n*]+\\\n)+     one or more non-final lines: text\ + newline
//   [^\n*]+              last line (no trailing \)
// )
// \*\*                   closing **
// ((?:\[\^[^\]]+\])*)    [2] zero or more footnote refs [^id]
const CASE1_RE = /\*\*((?:[^\n*]+\\\n)+[^\n*]+)\*\*((?:\[\^[^\]]+\])*)/g;

// Case 1b: like Case 1 but the bold block is split mid-last-line by a footnote,
// followed by a second bold segment that is appended to the last line.
//
// \*\*                   opening **
// (                      [1] verse body (same structure as Case 1)
//   (?:[^\n*]+\\\n)+     non-final lines
//   [^\n*]+              last partial line
// )
// \*\*                   closing ** (first half)
// ((?:\[\^[^\]]+\])+)    [2] one or more footnote refs (required here)
// \*\*                   opening ** (second half)
// ([^\n*]+)              [3] tail — appended to last line
// \*\*                   closing **
const CASE1B_RE = /\*\*((?:[^\n*]+\\\n)+[^\n*]+)\*\*((?:\[\^[^\]]+\])+)\*\*([^\n*]+)\*\*/g;

// Case 2: each line has its own bold wrapper; `\` continuation is outside the ** markers.
// [^\n]+ allows * inside to capture lines like **a** — **b**.
// Optional [ before the opening ** and ] after the closing ** are kept as-is.
//
// (                                [1] all lines
//   (?:\[?\*\*[^\n]+\*\*\\\n)+    one or more non-final lines: [?**text**\ + newline
//   \[?\*\*[^\n]+\*\*\]?          final line: [?**text**]?
// )
// ((?:\[\^[^\]]+\])*)              [2] zero or more footnote refs [^id]
const CASE2_RE = /((?:\[?\*\*[^\n]+\*\*\\\n)+\[?\*\*[^\n]+\*\*\]?)((?:\[\^[^\]]+\])*)/g;

// Case 2b: like Case 2 but the last line is split mid-bold by a footnote.
// Footnote is extracted after the block; tail is appended to the last line.
// Uses [^\n*]+ for the last partial line to stop before the ** of the tail.
//
// (                                    [1] verse body
//   (?:\[?\*\*[^\n]+\*\*\\\n)+         non-final lines (same as Case 2)
//   \[?\*\*[^\n*]+\*\*\]?             last partial line
// )
// ((?:\[\^[^\]]+\])+)                  [2] one or more footnote refs (required)
// \*\*([^\n*]+)\*\*                    [3] tail — appended to last line
const CASE2B_RE = /((?:\[?\*\*[^\n]+\*\*\\\n)+\[?\*\*[^\n*]+\*\*\]?)((?:\[\^[^\]]+\])+)\*\*([^\n*]+)\*\*/g;

// Case 4: per-line bold verse starting inline in a footnote definition.
// Each bold line has its own ** markers and ends with **\; continuation lines are
// 4-space-indented (footnote body syntax).  This differs from Cases 1/2 which either
// use a single bold block or require ** at the start of each line without indentation.
//
// ^(\[\^[^\]]+\]:)          [1] footnote definition marker [^id]:
// [ \t]+                    separator space(s)
// (                          [2] entire per-line bold block
//   \*\*[^\n]+\*\*\\\n      first bold line (no indent): **text**\ + newline
//   (?:[ \t]+\*\*[^\n]+\*\*\\\n)*  zero or more indented bold lines ending with **\
//   (?:[ \t]+\*\*[^\n]+\*\*)?      optional final indented bold line (no trailing \)
// )
const CASE4_RE = /^(\[\^[^\]]+\]:)[ \t]+(\*\*[^\n]+\*\*\\\n(?:[ \t]+\*\*[^\n]+\*\*\\\n)*(?:[ \t]+\*\*[^\n]+\*\*)?)/mg;

// Post-processing: footnote definition whose body begins with a 4-space-indented code
// line on the same line (produced when a bold verse was inline at the start of a footnote
// body).  The code line is moved to the next line with 8-space indent (4 for footnote
// continuation + 4 for the code block).
//
// ^(\[\^[^\]]+\]:)   footnote definition marker [^id]:
// \s+               any whitespace separating it from the code line
// (    .+)$         a 4-space-indented code line through end of line
const FOOTNOTE_INLINE_CODE_RE = /^(\[\^[^\]]+\]:)\s+(    .+)$/mg;

// Split `text` on `\` + newline, strip ** if requested, and indent each line with 4 spaces.
// Trailing empty strings (from a trailing \n in the input) are filtered out.
function toIndentedLines(text, stripBold = false) {
    return text
        .split('\\\n')
        .filter(line => line !== '')
        .map(line => `    ${stripBold ? line.replace(/\*\*/g, '') : line}`);
}

function withFootnotes(indented, footnotes) {
    return footnotes ? `${indented}\n${footnotes}` : indented;
}

function boldVersesToCode(doc) {
    // Case 1b — split bold: **inner**[^fn]**tail** (must run before Case 1)
    doc.text = doc.text.replace(CASE1B_RE, (match, inner, footnotes, tail) => {
        const lines = toIndentedLines(inner);
        lines[lines.length - 1] += tail;
        return withFootnotes(lines.join('\n'), footnotes);
    });

    // Case 1 — single bold block; no ** stripping needed inside
    doc.text = doc.text.replace(CASE1_RE, (match, inner, footnotes) => {
        return withFootnotes(toIndentedLines(inner).join('\n'), footnotes);
    });

    // Case 2b — per-line bold, last line split by mid-footnote (must run before Case 2)
    doc.text = doc.text.replace(CASE2B_RE, (match, inner, footnotes, tail) => {
        const lines = toIndentedLines(inner, true);
        lines[lines.length - 1] += tail;
        return withFootnotes(lines.join('\n'), footnotes);
    });

    // Case 2 — per-line bold; strip ** but keep [ ] as-is
    doc.text = doc.text.replace(CASE2_RE, (match, inner, footnotes) => {
        return withFootnotes(toIndentedLines(inner, true).join('\n'), footnotes);
    });

    // Case 0 — single bold line; runs last so multi-line cases claim their blocks first
    doc.text = doc.text.replace(CASE0_RE, (match, inner, footnotes) => {
        return withFootnotes(`    ${inner}`, footnotes);
    });

    // Case 4 — per-line bold verse inline in a footnote body.
    // Each bold line is stripped of ** markers, trimmed of leading indent, and
    // re-indented with 8 spaces (4 footnote continuation + 4 code block).
    doc.text = doc.text.replace(CASE4_RE, (match, def, block) => {
        const lines = block
            .split('\\\n')
            .filter(line => line !== '')
            .map(line => '        ' + line.trim().replace(/^\*\*|\*\*$/g, ''));
        return `${def}\n${lines.join('\n')}`;
    });

    // Post-processing: if a footnote definition has a 4-space-indented code line on the
    // same line (produced when a bold verse was inline at the start of a footnote body),
    // move the code line onto its own line with 8-space indent.
    doc.text = doc.text.replace(FOOTNOTE_INLINE_CODE_RE, (match, def, codeLine) => {
        return `${def}\n    ${codeLine}`;
    });
}

module.exports = { boldVersesToCode };
