export default function md_img(callback) {
  return (markdown) => {
    markdown.core.ruler.after('inline', 'replace-src-link', ({
      tokens,
      env
    }) => {
      for (let token of tokens) {
        if (token.type === 'inline' && token.children.length) {
          for (let child of token.children) {
            if (child.tag === 'img') {
              for (let attr of child.attrs) {
                const value = callback(attr[0], attr[1], env);
                if (value !== null && value !== undefined) {
                  attr[1] = value;
                }
              }
            }
          }
        }
      }
    });
  }
}