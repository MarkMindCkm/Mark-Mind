const exportHTML=(data)=>{
    return createHtml(data);
}

const createHtml=(data)=>{
    var html="<ul>";
    html+='<li data-id="'+data.id+'">';
    if(data.priority&&data.priority>0){
       html+='<span class="priority">优先级['+data.priority+']</span>';
    }
    if(data.percent&&data.percent>=0){
       html+='<span class="percent">完成度['+data.percent+'%]</span>';
    }
    if(data.link&&data.link>0){
       html+='<span class="link"><a href="'+data.link+'">链接</a></span>';
    }

    html+='<span class="text" style="font-size:'+data.fontSize+'px;font-style:'+data.fontStyle+';font-weight:'+data.fontWeight+';">'+data.text+'</span>';
    
    if(data.tag.length>0){
        let tagHtml=[];
        data.tag.forEach(ele=>{
            var tag=`<span class="tag" style="background:${ele.color};color:#fff">${ele.text}</span>`
            tagHtml.push(tag)
        });
        html+=tagHtml.join('')
    }
    
    if(data.remark){
        html+='<div class="remark markdown-body">'+marked(data.remark)+'</div>';
    }

    if(data.isImageNode){
        html+='<div class="image"><img src="'+data.image.src+'"/></div>';
    }
    
    data.children.forEach(ele=>{
        html+=createHtml(ele);
    });
    return html+='</ul>';
}

export default exportHTML