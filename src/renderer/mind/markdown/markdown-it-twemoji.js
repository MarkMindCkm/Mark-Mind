var emojies_defs = require('markdown-it-emoji/lib/data/full.json');
var emojies_shortcuts = require('markdown-it-emoji/lib/data/shortcuts');
var emoji_html = require('markdown-it-emoji/lib/render');
var emoji_replace = require('markdown-it-emoji/lib/replace');
var normalize_opts = require('markdown-it-emoji/lib/normalize_opts');

import twemoji from 'twemoji'

export default function emoji_plugin(md, options) {
    var defaults = {
        defs: emojies_defs,
        shortcuts: emojies_shortcuts,
        enabled: []
    };

    var opts = normalize_opts(md.utils.assign({}, defaults, options || {}));

    md.renderer.rules.emoji = function (token, idx) {
        return twemoji.parse(token[idx].content);
    };
    md.core.ruler.push('emoji', emoji_replace(md, opts.defs, opts.shortcuts, opts.scanRE, opts.replaceRE));
};