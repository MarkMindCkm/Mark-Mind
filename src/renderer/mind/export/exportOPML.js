var  htmlToText = require( '../markdown/jsHtmlToText').default;

const exportOPML=(data,title)=>{
    var nodeXml= createXml(data);
    console.log(nodeXml);
    var xml=`<?xml version="1.0" encoding="UTF-8"?>
               <opml version="2.0">
                 <head>
                    <tilte>${title}</title>
                 </head>
                 <body>
                    ${nodeXml}
                 </body>
              </opml>`;
    return xml;
}

const createXml=(data)=>{
    if(!data){
        return ''
    }
    var text=htmlToText(data.text);
    var html='<outline text="'+text+'"  id="'+data.id+'" ';
    if(data.link){
       html+='href='+data.link;
    }
    html+='>';
    data.children.forEach(c=>{
        html+=createXml(c);
    });
    return html+='</outline>';
}

export default exportOPML;