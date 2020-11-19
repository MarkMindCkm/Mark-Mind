const katex = require('katex');


/**
 *
 * @param content the math expression
 * @param openTag the open tag, eg: '\('
 * @param closeTag the close tag, eg: '\)'
 * @param displayMode whether to be rendered in display mode
 */
function ParseMath(content, openTag, closeTag, displayMode) {
    if (!content) {
        return "";
    }
        try {
           // console.log(content);
            return katex.renderToString(
                content,
                Object.assign({}, { displayMode }),
            );
        } catch (error) {
            return `<span style=\"color: #ee7f49; font-weight: 500;\">${error.toString()}</span>`;
        }

};

export default function(md) {
    // @ts-ignore
    md.inline.ruler.before("escape", "math", (state, silent) => {

        let openTag = null;
        let closeTag = null;
        let displayMode = true;

        const inlineDelimiters = [["$", "$"], ["\\(", "\\)"]];
        const blockDelimiters = [["$$", "$$"], ["\\[", "\\]"]];

        for (const tagPair of blockDelimiters) {
            if (state.src.startsWith(tagPair[0], state.pos)) {
                [openTag, closeTag] = tagPair;
                break;
            }
        }

        if (!openTag) {
            for (const tagPair of inlineDelimiters) {
                if (state.src.startsWith(tagPair[0], state.pos)) {
                    [openTag, closeTag] = tagPair;
                    displayMode = false;
                    break;
                }
            }
        }

        if (!openTag) {
            return false; // not math
        }

        let content = null;
        let end = -1;

        let i = state.pos + openTag.length;
        while (i < state.src.length) {
            if (state.src.startsWith(closeTag, i)) {
                end = i;
                break;
            } else if (state.src[i] === "\\") {
                i += 1;
            }
            i += 1;
        }

        if (end >= 0) {
            content = state.src.slice(state.pos + openTag.length, end);
         //   console.log(state);
           // console.log(content);
        } else {
            return false;
        }

        if (content && !silent) {
          //  console.log(content,111);
            const token = state.push("math");
            token.content = content.trim();
            token.openTag = openTag;
            token.closeTag = closeTag;
            token.displayMode = displayMode;

            state.pos += content.length + openTag.length + closeTag.length;
            return true;
        } else {
            return false;
        }
    });

    md.renderer.rules.math = (tokens, idx) => {
        const content = tokens[idx] ? tokens[idx].content : null;
        return ParseMath(
            content,
            (tokens[idx]).openTag,
            (tokens[idx]).closeTag,
            (tokens[idx]).displayMode,
        );
    };
};