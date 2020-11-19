var  htmlToText = require( '../markdown/jsHtmlToText').default
const exportFreeMind=(data)=>{
    var nodeXml= createXml(data);
    var xml=`<map version="1.0.1">${nodeXml}</map>`;
    return xml;
}

var htmlEncode=function(str) {//HTML des encode.
    var res=[];
    var pattern = new RegExp("[A-Za-z]+")
    for(var i=0;i < str.length;i++){  
            if(pattern.test(str[i])){
              res[i]=str[i]
            }else{
               res[i]='&#'+str.charCodeAt(i)+";";
            }
        }
        return res.join('');
};

var htmlDecode = function(str) {
    return str.replace(/&#(x)?([^&]{1,5});?/g,function($,$1,$2) {
        return String.fromCharCode(parseInt($2 , $1 ? 16:10));
    });
};

const createXml=(data)=>{
    if(!data){
        return ''
    }
    if(data.isImageNode){
        var html='<node ID="'+data.id+'" ';
    }else{
        var html='<node  TEXT="'+htmlEncode(htmlToText(data.text))+'"  ID="'+data.id+'" ';
    }
    if(data.link){
        html=html+' LINK="'+htmlEncode(data.link)+'"';
    }
    html+='>';
    if(data.isImageNode){
        html+='<richcontent TYPE="NODE"><html><head></head><body><img src="'+htmlEncode(data.image)+'"/><p>'+htmlEncode(data.text.trim())+'</p></body></html></richcontent>'
    }

    if(data.priority){
        html+='<icon BUILTIN="full-'+data.priority+'"/>';
    }

    if(data.wireFrame){
        html+='<cloud/>'
    }
    
    
    
    data.children.forEach(c=>{
        html+=createXml(c);
    });

    return html+='</node>';
}

export default exportFreeMind;