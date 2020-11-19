var Store = require('electron-store')
var store = new Store();
var profile = store.get('config');
let theme = profile.theme || 'theme-light';


if (theme == 'theme-light') {
  require('highlight.js/styles/atelier-cave-light.css');
} else {
  require('highlight.js/styles/monokai-sublime.css');
}

import hljs from 'highlight.js'

const highlightPlugin = md => {
  md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx]
    const code = token.content.trim()
    const lang = token.info ? [token.info] : undefined
    return `<pre class="hljs"><code>${hljs.highlightAuto(code, lang).value}</code></pre>`
  }
}

export default highlightPlugin