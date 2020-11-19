export default function markdownItUnderline (md) {

    function renderEm (tokens, idx, opts, _, slf) {
      var token = tokens[idx];
      if (token.markup === '_') {
        token.tag = 'u';
      }
      return slf.renderToken(tokens, idx, opts);
    }
  
    md.renderer.rules.em_open = renderEm;
    md.renderer.rules.em_close = renderEm;
  };