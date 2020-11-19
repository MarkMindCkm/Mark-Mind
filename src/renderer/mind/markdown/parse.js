import path from 'path'

import markdownIt from 'markdown-it'
import markdownItHighlight from './markdown-it-highlight'

import markdownMath from './markdown-it-math'
import muiltTable from 'markdown-it-multimd-table'
import emoji from 'markdown-it-emoji'

import markdownItIcons from './markdown-it-icon'
import mark from 'markdown-it-mark'
// import footnode from 'markdown-it-footnote'
import sub from 'markdown-it-sub'
import sup from 'markdown-it-sup'
import abbr from 'markdown-it-abbr'

import underline from './markdown-it-underline';
import imsize from 'markdown-it-imsize'
import attr from 'markdown-it-attrs'
import attrBreak from 'markdown-it-bracketed-spans'

import mdecharts from './markdown-it-plugin-echarts'
import mdmermaid from './markdown-it-plugin-mermaid'
import mdflowchart from './markdown-it-plugin-flowchart'
import plantuml from 'markdown-it-plantuml'
import markdownItContainer from 'markdown-it-container'
import emptyText from './markdown-it-emptytext'
// import html5embed from 'markdown-it-html5-embed'
import markdownItImg from './markdown-it-img';

var Store = require('electron-store')
var store = new Store();
var profile = store.get('config');

import './mhchem.js'


var md = new markdownIt({
  html: true,
  linkify: true,
  breaks: true,
});

const defaultValidateLink = md.validateLink;
md.validateLink = url => /^data:image\/.*?;/.test(url) || defaultValidateLink(url);

md.use(markdownItImg((attr, value, env) => {
  if (attr === 'src') {
    if (value.startsWith('http') || value.startsWith('file') || value.startsWith('data:image') || path.isAbsolute(value)) {
      return value
    } else {
      try {
        value = path.resolve(baseUrl, value);
        return value;
      } catch (err) {
        return value;
      }
    }
  }
}));

md.use(markdownItHighlight);

if (!profile.math || profile.math == 'katex') {
  md.use(markdownMath)
} else {
  md.use(require('markdown-it-latex2img'), {
    style: "transform:scale(0.9);transform-origin:left;text-align:center;vertical-align:middle;"
  });
}

md.use(muiltTable, {
  multiline: true,
  rowspan: true,
  headerless: true
});

md.use(markdownItContainer, 'warning', {
    validate: function (params) {
      return params.trim() === 'warning'
    },
    render: (tokens, idx) => {
      if (tokens[idx].nesting === 1) {
        const icon = `<i class="markdown-it-vue-alert-icon markdown-it-vue-alert-icon-warning"><svg viewBox="64 64 896 896" data-icon="exclamation-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" class=""><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 0 1 0-96 48.01 48.01 0 0 1 0 96z"></path></svg></i>`
        return `<div class="markdown-it-vue-alter markdown-it-vue-alter-warning">${icon}`
      } else {
        return '</div>'
      }
    }
  })
  .use(markdownItContainer, 'info', {
    validate: function (params) {
      return params.trim() === 'info'
    },
    render: (tokens, idx) => {
      if (tokens[idx].nesting === 1) {
        const icon = `<i class="markdown-it-vue-alert-icon markdown-it-vue-alert-icon-info"><svg viewBox="64 64 896 896" data-icon="info-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" class=""><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272zm-32-344a48.01 48.01 0 0 1 0-96 48.01 48.01 0 0 1 0 96z"></path></svg></i>`
        return `<div class="markdown-it-vue-alter markdown-it-vue-alter-info">${icon}`
      } else {
        return '</div>'
      }
    }
  })
  .use(markdownItContainer, 'success', {
    validate: function (params) {
      return params.trim() === 'success'
    },
    render: (tokens, idx) => {
      if (tokens[idx].nesting === 1) {
        const icon = `<i class="markdown-it-vue-alert-icon markdown-it-vue-alert-icon-success"><svg viewBox="64 64 896 896" data-icon="check-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" class=""><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 0 1-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z"></path></svg></i>`
        return `<div class="markdown-it-vue-alter markdown-it-vue-alter-success">${icon}`
      } else {
        return '</div>'
      }
    }
  })
  .use(markdownItContainer, 'error', {
    validate: function (params) {
      return params.trim() === 'error'
    },
    render: (tokens, idx) => {
      if (tokens[idx].nesting === 1) {
        const icon = `<i class="markdown-it-vue-alert-icon markdown-it-vue-alert-icon-error"><svg viewBox="64 64 896 896" data-icon="close-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" class=""><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 0 1-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"></path></svg></i>`
        return `<div class="markdown-it-vue-alter markdown-it-vue-alter-error">${icon}`
      } else {
        return '</div>'
      }
    }
  });

md.use(markdownItIcons, 'font-awesome')
md.use(emoji);
md.use(mark);
md.use(underline)

md.use(sub);
md.use(sup);
md.use(abbr);
md.use(imsize);
md.use(attrBreak).use(attr, {
  leftDelimiter: '{{',
  rightDelimiter: '}}'
});
md.use(mdecharts);
md.use(mdmermaid);
md.use(plantuml, {
  server: profile.plantumlServer || ''
});
md.use(mdflowchart);
md.use(emptyText);
// md.use(html5embed,{
//     html5embed:{
//         useImageSyntax: true,
//         useLinkSyntax: false,
//         attributes: {
//             'audio': 'width="320" controls class="audioplayer"',
//             'video': 'width="320" height="240" class="audioplayer" controls'
//           }
//     },

// })

export default md;