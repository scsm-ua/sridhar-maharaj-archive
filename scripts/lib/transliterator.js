var latin_chars = {
    "0": "",
    "1": "",
    "2": "",
    "3": "",
    "4": "",
    "5": "",
    "6": "",
    "7": "",
    "8": "",
    "9": "",
    "a": "",
    "b": "",
    "c": "",
    "d": "",
    "e": "",
    "f": "",
    "g": "",
    "h": "",
    "i": "",
    "j": "",
    "k": "",
    "l": "",
    "m": "",
    "n": "",
    "o": "",
    "p": "",
    "q": "",
    "r": "",
    "s": "",
    "t": "",
    "u": "",
    "v": "",
    "w": "",
    "x": "",
    "y": "",
};

var dash_chars = {
    "\n": "",
    " ": "",
    "!": "",
    "(": "",
    ")": "",
    "*": "",
    ",": "",
    "-": "",
    ".": "",
    "/": "",
    ":": "",
    ";": "",
    ">": "",
    "?": "",
    "[": "",
    "\\": "",
    "]": "",
    "}": "",
    " ": "",
    "«": "",
    "»": "",
    "‑": "",
    "–": "",
    "—": "",
    "‘": "",
    "’": "",
    "“": "",
    "”": "",
    "„": "",
    "…": ""
};

var skip_chars = {
    "": "",
    "́": "",
    "̃": "",
    "̄": "",
    "̇": "",
    "̐": "",
    "̣": "",
    "ъ": "",
    "ь": "",
};

var dict = {  
    "ú": "u",
    "ā": "a",
    "а": "a",
    "б": "b",
    "в": "v",
    "г": "g",
    "д": "d",
    "е": "e",
    "ж": "zh",
    "з": "z",
    "и": "i",
    "й": "j",
    "к": "k",
    "л": "l",
    "м": "m",
    "н": "n",
    "о": "o",
    "п": "p",
    "р": "r",
    "с": "s",
    "т": "t",
    "у": "u",
    "ф": "f",
    "х": "h",
    "ц": "c",
    "ч": "ch",
    "ш": "sh",
    "щ": "shch",
    "ы": "y",
    "э": "e",
    "ю": "yu",
    "я": "ya",
    "ё": "yo",
    "ӣ": "jo",
    "ӯ": "u"
};

exports.transliterate = function(text) {
    text = text.toLowerCase();
    var result = '';
    for(var i = 0; i < text.length; i++) {
        var char = text.charAt(i);
        var replacement;
        if (char in latin_chars) {
            replacement = char;
        } else if (char in dash_chars) {
            replacement = '-';
        } else if (char in skip_chars) {
            replacement = '';
        } else if (char in dict) {
            replacement = dict[char];
        } else {
            console.error('Cant find replacement char for', JSON.stringify(char));
        }
        result += (replacement || '');
    }
    result = result.replace(/-+/g, '-');
    result = result.replace(/-$/g, '');
    result = result.replace(/^-/g, '');
    return result;
};