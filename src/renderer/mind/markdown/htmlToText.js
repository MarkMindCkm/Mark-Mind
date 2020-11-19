const _inlineTags = new Set(['b', 'big', 'i', 'small', 'tt', 'abbr', 'acronym',
  'cite', 'code', 'dfn', 'em', 'kbd', 'strong', 'samp',
  'var', 'a', 'bdo', 'br', 'img', 'map', 'object', 'q',
  'script', 'span', 'sub', 'sup', 'button', 'input', 'label',
  'select', 'textarea'
]);

export default function (node) {
  let isStartOfLine = true;
  let text = '';

  const appendText = (childNodes) => {
    for (let index = 0; index < childNodes.length; index++) {
      let node = childNodes[index];

      if (node.nodeType === 3) {
        // text node
        text += node.textContent;
        isStartOfLine = false;
        continue;
      }

      if (node.tagName === 'BR') {
        text += '\n';
        isStartOfLine = true;
        continue;
      }

      if (_inlineTags.has(node.tagName)) {
        appendText(node.childNodes);
        continue;
      }

      if (!isStartOfLine) {
        text += '\n';
        isStartOfLine = true;
      }

      appendText(node.childNodes);

      if (!isStartOfLine) {
        text += '\n';
        isStartOfLine = true;
      }
    }
  }

  appendText(node.childNodes);

  if (text.length && text.charAt(text.length - 1) === '\n')
    text = text.substring(0, text.length - 1);

  return text
};