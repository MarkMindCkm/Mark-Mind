import '../../assets/fontAwsome/css/font-awesome.min.css';

import {
  rendererRule,
  coreRuler
} from 'markdown-it-regex'
import faIconChars from 'font-awesome-icon-chars'
const iconsPlugin = (md, name) => {
  let options = null
  switch (name) {
    case 'font-awesome':
      let faIcons = []
      faIconChars.forEach((char) => {
        faIcons = faIcons.concat(char.id).concat(char.aliases || [])
      })
      const faRegex = new RegExp(`(:fa-(?:${faIcons.join('|')}):)`)
      options = {
        name,
        regex: faRegex,
        replace: (match) => `<i class="fa ${match.slice(1, -1)}"></i>`
      }
      break
    default:
      return
  }
  md.renderer.rules[options.name] = (tokens, idx) => {
    return rendererRule(tokens, idx, options)
  }
  md.core.ruler.push(options.name, (state) => {
    coreRuler(state, options)
  })
}

export default iconsPlugin