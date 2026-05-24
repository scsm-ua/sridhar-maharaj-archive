const path = require('path');

/** Cyrillic → Latin transliteration table (lowercase only; input is lowercased before lookup) */
const CYRILLIC_MAP = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
  'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
  'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
  'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
  'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
  'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '',
  'э': 'e', 'ю': 'yu', 'я': 'ya',
};

function transliterate(str) {
  return str
    .toLowerCase()
    .split('')
    .map(ch => (CYRILLIC_MAP[ch] !== undefined ? CYRILLIC_MAP[ch] : ch))
    .join('');
}

function toSlugPart(str) {
  return transliterate(str)
    .replace(/\s*-{2,}\s*/g, '-')
    .replace(/\s*-\s*/g, '-')
    .replace(/[^a-z0-9-]+/g, '_')
    .replace(/^[_-]+|[_-]+$/g, '');
}

const TITLE_MAX_CHARS = 200;

function limitTitleSlug(slug) {
  if (slug.length <= TITLE_MAX_CHARS) return slug;
  const cut = slug.slice(0, TITLE_MAX_CHARS);
  const lastSep = Math.max(cut.lastIndexOf('_'), cut.lastIndexOf('-'));
  let limited = lastSep > 0 ? cut.slice(0, lastSep) : cut;
  limited = limited.replace(/[_-]+$/g, '');
  limited = limited.replace(/([_-][a-z0-9]{1,3})+$/g, '');
  return limited.replace(/[_-]+$/g, '');
}

function generateSlug(meta) {
  const title = (meta.legacy && meta.legacy.title_from_filename) || meta.title;
  const titlePart = title ? limitTitleSlug(toSlugPart(title)) : '';

  // Build the id part from record_id, falling back to date
  let idPart;
  if (meta.record_id) {
    const idBase = meta.record_id.toLowerCase().replace(/\./g, '-');
    idPart = meta.variant ? `${idBase}-v${toSlugPart(String(meta.variant))}` : idBase;
  } else if (meta.date) {
    idPart = String(meta.date);
  } else {
    idPart = null;
  }

  if (!idPart && !titlePart) return null;
  if (!idPart) return titlePart;
  if (!titlePart) return idPart;
  return `${idPart}_${titlePart}`;
}

function isSkipFolder(filename) {
  const parts = filename.split(path.sep);
  return parts.includes('_full') || parts.includes('old');
}

function fixSlug(doc) {
  if (!doc.meta || !doc.filename) return;
  if (isSkipFolder(doc.filename)) return;

  const newSlug = generateSlug(doc.meta);
  if (!newSlug) return;

  const oldSlug = doc.meta.slug;

  if (!doc.meta.legacy) {
    doc.meta.legacy = {};
  }
  doc.meta.legacy.slug = oldSlug;

  doc.meta.slug = newSlug;
}

module.exports = { fixSlug };
