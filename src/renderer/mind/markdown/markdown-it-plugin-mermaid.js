import mermaid from 'mermaid'

const mermaidChart = (code,w,h) => {
  try {
    // console.log(code);
    mermaid.parse(code);
 

    return `<div class="mermaid" style="width:${w?w:'100%'}px;">${code}</div>`
  } catch ({ str, hash }) {
    return `<pre>${str}</pre>`
  }
}

const MermaidPlugin = (md) => {
  md.mermaid = mermaid
  mermaid.loadPreferences = (preferenceStore) => {
    let mermaidTheme = preferenceStore.get('mermaid-theme')
    if (mermaidTheme === undefined) {
      mermaidTheme = 'default'
    }
    let ganttAxisFormat = preferenceStore.get('gantt-axis-format')
    if (ganttAxisFormat === undefined) {
      ganttAxisFormat = '%Y-%m-%d'
    }
    mermaid.initialize({
      theme: mermaidTheme,
      gantt: { axisFormatter: [
        [ganttAxisFormat, (d) => {
          return d.getDay() === 1
        }]
      ]}
    })
    return {
      'mermaid-theme': mermaidTheme,
      'gantt-axis-format': ganttAxisFormat
    }
  }

  const temp = md.renderer.rules.fence.bind(md.renderer.rules)
  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx]
    const code = token.content.trim();

    var infoArr=token.info.split('|');

    var w,h;

    if(infoArr.length>1){
        var info=infoArr[1];
        var configArr=info.split(' ');
        if(configArr.length){
          configArr.forEach(str=>{
            var s=str.trim();
            if(s.indexOf('width')>-1){
               w=s.split(':')[1]
            }
            if(s.indexOf('height')>-1){
              h=s.split(':')[1]
            }
          })
        }
    }
   
    if (token.info === 'mermaid') {
      return mermaidChart(code,w,h)
    }

    

    const firstLine = code.split(/\n/)[0].trim();
    if (firstLine === 'gantt' || firstLine === 'sequenceDiagram' || firstLine.match(/^graph (?:TB|BT|RL|LR|TD);?$/) || firstLine=='classDiagram'||firstLine=='stateDiagram'||firstLine=='pie'||firstLine=='erDiagram'||firstLine=='journey') {
      return mermaidChart(code,w,h)
    }
    return temp(tokens, idx, options, env, slf)
  }
}

export default MermaidPlugin
